import { one, run } from '../db.js';
import { generateOrderCode } from './orderCode.js';
import { getSystemTimeISO } from './systemTime.js';

const TEN_DAYS = 10;

export function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export function shippedTimestamps() {
  const shippedAt = getSystemTimeISO();
  return { shippedAt, autoConfirmAt: addDays(shippedAt, TEN_DAYS) };
}

export async function refundOrder(db, order, env = null) {
  const qty = order.quantity || 1;
  const tokenRefund = Number(order.amount_tokens ?? 0);
  const legacyFull = !order.amount_tokens && !order.amount_stripe;
  const tokensBack = legacyFull ? Number(order.total_price || 0) : tokenRefund;

  if (tokensBack > 0) {
    await run(db, 'UPDATE buyers SET tokens = tokens + ? WHERE id = ?', tokensBack, order.buyer_id);
  }
  await run(db, 'UPDATE products SET stock = stock + ? WHERE id = ?', qty, order.product_id);

  const stripeAmt = Number(order.amount_stripe || 0);
  if (env && stripeAmt > 0 && order.stripe_session_id) {
    try {
      const { getSessionPaymentIntent, refundStripePayment } = await import('../stripe.js');
      const pi = await getSessionPaymentIntent(env, order.stripe_session_id);
      if (pi) await refundStripePayment(env, typeof pi === 'string' ? pi : pi.id, stripeAmt);
    } catch (err) {
      console.error('Stripe refund failed', err);
      throw new Error(`订单已回库存/余额，但 Stripe 退款失败：${err.message}`);
    }
  }
}

export function parseReturnImages(order) {
  if (!order.return_images) return [];
  try {
    const arr = typeof order.return_images === 'string' ? JSON.parse(order.return_images) : order.return_images;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function formatOrder(order) {
  if (!order) return order;
  return {
    ...order,
    quantity: order.quantity || 1,
    return_images: parseReturnImages(order),
    has_review: !!order.has_review,
    currency: order.currency || 'hkd',
    amount_tokens: Number(order.amount_tokens || 0),
    amount_stripe: Number(order.amount_stripe || 0)
  };
}

export async function runAutoConfirmOrders(db) {
  await loadOffsetIfNeeded(db);
  const now = getSystemTimeISO();
  const result = await run(db, `
    UPDATE orders
    SET status = 'completed', confirmed_at = ?
    WHERE status = 'shipped'
      AND auto_confirm_at IS NOT NULL
      AND auto_confirm_at <= ?
  `, now, now);
  return result.meta?.changes ?? 0;
}

async function loadOffsetIfNeeded(db) {
  const { loadSystemTimeOffset } = await import('./systemTime.js');
  await loadSystemTimeOffset(db);
}

/**
 * Place one order line. Token debit is only amount_tokens (HKD gift credit).
 * Stripe portion is recorded but already collected via Checkout.
 */
export async function placeOrder(db, {
  buyerId, productId, quantity, contact,
  amountTokens = null, amountStripe = null, stripeSessionId = '',
  skipBalanceCheck = false, skipTokenDebit = false
}) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = await one(db, 'SELECT * FROM products WHERE id = ? AND status = ?', productId, 'active');
  if (!product) throw new Error('NOT_FOUND');
  if (product.stock < qty) throw new Error('OUT_OF_STOCK');

  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * qty;

  let payTokens = amountTokens == null ? totalPrice : Number(amountTokens);
  let payStripe = amountStripe == null ? 0 : Number(amountStripe);
  if (amountTokens == null && amountStripe == null) {
    // Legacy full-token path
    payTokens = totalPrice;
    payStripe = 0;
  }

  payTokens = Math.round(payTokens * 100) / 100;
  payStripe = Math.round(payStripe * 100) / 100;

  if (!skipBalanceCheck && !skipTokenDebit && payTokens > 0) {
    const buyer = await one(db, 'SELECT tokens FROM buyers WHERE id = ?', buyerId);
    if ((buyer?.tokens ?? 0) < payTokens - 1e-9) throw new Error('INSUFFICIENT_TOKENS');
  }

  const updated = await run(db, `
    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
  `, qty, productId, qty);
  if ((updated.meta?.changes ?? 0) === 0) throw new Error('OUT_OF_STOCK');

  if (!skipTokenDebit && payTokens > 0) {
    const tok = await run(db, `
      UPDATE buyers SET tokens = tokens - ? WHERE id = ? AND tokens >= ?
    `, payTokens, buyerId, payTokens);
    if ((tok.meta?.changes ?? 0) === 0) throw new Error('INSUFFICIENT_TOKENS');
  }

  const paymentMethod = payStripe > 0 && payTokens > 0 ? 'mixed'
    : payStripe > 0 ? 'stripe' : 'tokens';

  const orderCode = await generateOrderCode(db);
  const now = getSystemTimeISO();
  const result = await run(db, `
    INSERT INTO orders (
      buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone,
      total_price, order_code, status, created_at,
      currency, amount_tokens, amount_stripe, stripe_session_id, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, 'hkd', ?, ?, ?, ?)
  `,
    buyerId, productId, qty, unitPrice,
    contact.contact_email, contact.contact_name, contact.address, contact.phone,
    totalPrice, orderCode, now,
    payTokens, payStripe, stripeSessionId || '', paymentMethod
  );
  return {
    id: result.meta.last_row_id,
    order_code: orderCode,
    total_price: totalPrice,
    amount_tokens: payTokens,
    amount_stripe: payStripe,
    payment_method: paymentMethod
  };
}

/** Split gift-credit (tokens) across line items 1:1 HKD, remainder is Stripe. */
export function allocatePayments(lines, tokensAvailable) {
  let remaining = Math.max(0, Number(tokensAvailable) || 0);
  const allocated = [];
  let total = 0;
  let tokensToUse = 0;
  let stripeAmount = 0;

  for (const line of lines) {
    const lineTotal = Math.round(line.unitPrice * line.quantity * 100) / 100;
    total += lineTotal;
    const useTok = Math.min(remaining, lineTotal);
    const useStripe = Math.round((lineTotal - useTok) * 100) / 100;
    remaining = Math.round((remaining - useTok) * 100) / 100;
    tokensToUse += useTok;
    stripeAmount += useStripe;
    allocated.push({ ...line, lineTotal, amountTokens: useTok, amountStripe: useStripe });
  }

  return {
    lines: allocated,
    total: Math.round(total * 100) / 100,
    tokensToUse: Math.round(tokensToUse * 100) / 100,
    stripeAmount: Math.round(stripeAmount * 100) / 100
  };
}

export async function buildCheckoutLines(db, items) {
  const lines = [];
  for (const item of items) {
    const productId = parseInt(item.product_id, 10);
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const product = await one(db, 'SELECT * FROM products WHERE id = ? AND status = ?', productId, 'active');
    if (!product) throw new Error('NOT_FOUND');
    if (product.stock < quantity) throw new Error('OUT_OF_STOCK');
    lines.push({
      productId,
      quantity,
      unitPrice: Number(product.price),
      name: product.name,
      image: product.image_thumb || product.image_preview || product.image || ''
    });
  }
  if (!lines.length) throw new Error('EMPTY_CART');
  return lines;
}

export const ORDER_LIST_SELECT = `
  SELECT o.*, p.name AS product_name, p.image AS product_image,
    (SELECT 1 FROM reviews r WHERE r.order_id = o.id LIMIT 1) AS has_review
`;

export function orderErrorMessage(err) {
  if (err.message === 'NOT_FOUND') return { status: 404, error: '商品不存在或已下架' };
  if (err.message === 'OUT_OF_STOCK') return { status: 400, error: '商品库存不足' };
  if (err.message === 'INSUFFICIENT_TOKENS') return { status: 400, error: '赠送余额不足' };
  if (err.message === 'EMPTY_CART') return { status: 400, error: '购物车为空' };
  if (err.message === 'STRIPE_NOT_CONFIGURED') return { status: 503, error: 'Stripe 未配置，请联系管理员' };
  return null;
}
