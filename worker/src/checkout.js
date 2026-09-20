import { one, run } from './db.js';
import { allocatePayments, buildCheckoutLines, placeOrder } from './utils/orderHelpers.js';
import { createCheckoutSession, toStripeAmount, CURRENCY } from './stripe.js';
import { getSystemTimeISO } from './utils/systemTime.js';

async function deductGiftCredit(db, buyerId, amount) {
  const amt = Math.round(Number(amount) * 100) / 100;
  if (!(amt > 0)) return;
  const tok = await run(db, `
    UPDATE buyers SET tokens = tokens - ? WHERE id = ? AND tokens >= ?
  `, amt, buyerId, amt);
  if ((tok.meta?.changes ?? 0) === 0) throw new Error('INSUFFICIENT_TOKENS');
}

async function refundGiftCredit(db, buyerId, amount) {
  const amt = Math.round(Number(amount) * 100) / 100;
  if (!(amt > 0)) return;
  await run(db, 'UPDATE buyers SET tokens = tokens + ? WHERE id = ?', amt, buyerId);
}

export async function startPayment(env, { buyerId, items, contact, clearCart = false, origin }) {
  const buyer = await one(env.DB, 'SELECT tokens, email FROM buyers WHERE id = ?', buyerId);
  const lines = await buildCheckoutLines(env.DB, items);
  const plan = allocatePayments(lines, buyer.tokens);

  // Full gift-credit payment — no Stripe needed
  if (plan.stripeAmount <= 0) {
    const created = [];
    for (const line of plan.lines) {
      created.push(await placeOrder(env.DB, {
        buyerId,
        productId: line.productId,
        quantity: line.quantity,
        contact,
        amountTokens: line.amountTokens,
        amountStripe: 0
      }));
    }
    if (clearCart) await run(env.DB, 'DELETE FROM cart_items WHERE buyer_id = ?', buyerId);
    const tokens = await one(env.DB, 'SELECT tokens FROM buyers WHERE id = ?', buyerId);
    return { paid: true, orders: created, tokens: tokens.tokens };
  }

  if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_NOT_CONFIGURED');

  // Hold gift credit until Stripe webhook fulfills (or session expires → release)
  await deductGiftCredit(env.DB, buyerId, plan.tokensToUse);

  const payload = {
    lines: plan.lines.map(l => ({
      productId: l.productId,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      name: l.name,
      amountTokens: l.amountTokens,
      amountStripe: l.amountStripe,
      lineTotal: l.lineTotal
    })),
    contact,
    clearCart: !!clearCart
  };

  let checkoutId;
  try {
    const insert = await run(env.DB, `
      INSERT INTO checkout_sessions (buyer_id, payload, tokens_to_use, stripe_amount, total_amount, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `, buyerId, JSON.stringify(payload), plan.tokensToUse, plan.stripeAmount, plan.total, getSystemTimeISO());
    checkoutId = insert.meta.last_row_id;

    const stripeLines = plan.lines
      .filter(l => l.amountStripe > 0)
      .map(l => ({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toStripeAmount(l.amountStripe),
          product_data: {
            name: l.name,
            ...(l.amountTokens > 0
              ? { description: `Gift credit offset HK$${l.amountTokens.toFixed(2)}` }
              : {})
          }
        }
      }));

    if (!stripeLines.length) {
      stripeLines.push({
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: toStripeAmount(plan.stripeAmount),
          product_data: { name: 'Order payment' }
        }
      });
    }

    const base = String(origin || '').replace(/\/$/, '') || 'https://shop-platform.hinako-mori.workers.dev';
    const session = await createCheckoutSession(env, {
      lineItems: stripeLines,
      successUrl: `${base}/orders?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: clearCart
        ? `${base}/cart?canceled=1&checkout_id=${checkoutId}`
        : `${base}/?canceled=1&checkout_id=${checkoutId}`,
      clientReferenceId: checkoutId,
      metadata: {
        checkout_id: String(checkoutId),
        buyer_id: String(buyerId)
      }
    });

    await run(env.DB, `
      UPDATE checkout_sessions SET stripe_session_id = ? WHERE id = ?
    `, session.id, checkoutId);

    return {
      paid: false,
      url: session.url,
      checkout_id: checkoutId,
      total: plan.total,
      tokens_to_use: plan.tokensToUse,
      stripe_amount: plan.stripeAmount
    };
  } catch (err) {
    await refundGiftCredit(env.DB, buyerId, plan.tokensToUse);
    if (checkoutId) {
      await run(env.DB, `UPDATE checkout_sessions SET status = 'failed' WHERE id = ?`, checkoutId);
    }
    throw err;
  }
}

export async function completeCheckoutFromStripe(env, stripeSession) {
  if (stripeSession.payment_status && stripeSession.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  const checkoutId = parseInt(stripeSession.metadata?.checkout_id || stripeSession.client_reference_id, 10);
  if (!checkoutId) throw new Error('Missing checkout_id');

  const row = await one(env.DB, 'SELECT * FROM checkout_sessions WHERE id = ?', checkoutId);
  if (!row) throw new Error('Checkout session not found');
  if (row.status === 'completed') return { already: true, orders: [] };
  if (row.status === 'cancelled' || row.status === 'failed') {
    throw new Error('Checkout session is no longer valid');
  }

  const payload = JSON.parse(row.payload);
  const created = [];
  for (const line of payload.lines) {
    created.push(await placeOrder(env.DB, {
      buyerId: row.buyer_id,
      productId: line.productId,
      quantity: line.quantity,
      contact: payload.contact,
      amountTokens: line.amountTokens,
      amountStripe: line.amountStripe,
      stripeSessionId: stripeSession.id,
      skipBalanceCheck: true,
      skipTokenDebit: true // already held at Checkout create
    }));
  }

  await run(env.DB, `UPDATE checkout_sessions SET status = 'completed' WHERE id = ?`, checkoutId);
  if (payload.clearCart) {
    await run(env.DB, 'DELETE FROM cart_items WHERE buyer_id = ?', row.buyer_id);
  }
  return { already: false, orders: created };
}

/** Release held gift credit when Stripe Checkout is abandoned / expires */
export async function releaseCheckoutHold(env, stripeSessionOrId) {
  let checkoutId;
  if (typeof stripeSessionOrId === 'number' || (typeof stripeSessionOrId === 'string' && /^\d+$/.test(stripeSessionOrId))) {
    checkoutId = parseInt(stripeSessionOrId, 10);
  } else {
    const stripeSession = stripeSessionOrId;
    checkoutId = parseInt(stripeSession.metadata?.checkout_id || stripeSession.client_reference_id, 10);
  }
  if (!checkoutId) return;

  const row = await one(env.DB, 'SELECT * FROM checkout_sessions WHERE id = ?', checkoutId);
  if (!row || row.status !== 'pending') return;

  await refundGiftCredit(env.DB, row.buyer_id, row.tokens_to_use);
  await run(env.DB, `UPDATE checkout_sessions SET status = 'cancelled' WHERE id = ?`, checkoutId);
}

export async function releaseCheckoutHoldForBuyer(env, checkoutId, buyerId) {
  const row = await one(env.DB, 'SELECT * FROM checkout_sessions WHERE id = ?', checkoutId);
  if (!row) throw new Error('Checkout session not found');
  if (row.buyer_id !== buyerId) throw new Error('Forbidden');
  if (row.status !== 'pending') return { released: false };
  await refundGiftCredit(env.DB, row.buyer_id, row.tokens_to_use);
  await run(env.DB, `UPDATE checkout_sessions SET status = 'cancelled' WHERE id = ?`, checkoutId);
  return { released: true };
}
