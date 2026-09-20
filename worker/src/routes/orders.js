import { Hono } from 'hono';
import { one, all, run } from '../db.js';
import { adminAuth, buyerAuth } from '../auth.js';
import {
  formatOrder, refundOrder, shippedTimestamps,
  ORDER_LIST_SELECT, orderErrorMessage
} from '../utils/orderHelpers.js';
import { getSystemTimeISO } from '../utils/systemTime.js';
import { putUpload } from '../storage.js';
import { startPayment, completeCheckoutFromStripe, releaseCheckoutHoldForBuyer } from '../checkout.js';
import { getStripe } from '../stripe.js';

const orders = new Hono();

function requestOrigin(c) {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}`;
}

/** Direct buy / cart checkout → gift credit first, then Stripe Checkout (HKD) */
orders.post('/pay', buyerAuth, async (c) => {
  try {
    const body = await c.req.json();
    const buyer = c.get('buyer');
    const items = body.items?.length
      ? body.items
      : [{ product_id: body.product_id, quantity: body.quantity }];
    if (!items.length || (!body.product_id && !body.items?.length)) {
      return c.json({ error: '请选择商品' }, 400);
    }
    const contact = {
      contact_email: body.contact_email,
      contact_name: body.contact_name,
      address: body.address,
      phone: body.phone
    };
    const result = await startPayment(c.env, {
      buyerId: buyer.id,
      items,
      contact,
      clearCart: !!body.clear_cart,
      origin: requestOrigin(c)
    });
    return c.json(result);
  } catch (err) {
    const mapped = orderErrorMessage(err);
    if (mapped) return c.json({ error: mapped.error }, mapped.status);
    return c.json({ error: err.message || '支付失败' }, 400);
  }
});

/** After Stripe redirect — fulfill if webhook is late */
orders.post('/complete-session', buyerAuth, async (c) => {
  try {
    const { session_id } = await c.req.json();
    if (!session_id) return c.json({ error: '缺少 session_id' }, 400);
    const buyer = c.get('buyer');
    const stripe = getStripe(c.env);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (String(session.metadata?.buyer_id) !== String(buyer.id)) {
      return c.json({ error: '无权完成此支付' }, 403);
    }
    const result = await completeCheckoutFromStripe(c.env, session);
    const tokens = await one(c.env.DB, 'SELECT tokens FROM buyers WHERE id = ?', buyer.id);
    return c.json({ ...result, tokens: tokens.tokens });
  } catch (err) {
    return c.json({ error: err.message || '完成支付失败' }, 400);
  }
});

/** Cancel Stripe Checkout and release held gift credit */
orders.post('/cancel-checkout', buyerAuth, async (c) => {
  try {
    const { checkout_id } = await c.req.json();
    const buyer = c.get('buyer');
    const result = await releaseCheckoutHoldForBuyer(c.env, parseInt(checkout_id, 10), buyer.id);
    const tokens = await one(c.env.DB, 'SELECT tokens FROM buyers WHERE id = ?', buyer.id);
    return c.json({ ...result, tokens: tokens.tokens });
  } catch (err) {
    return c.json({ error: err.message || '取消失败' }, 400);
  }
});

/** @deprecated Prefer POST /pay — kept for compatibility, routes through Stripe flow */
orders.post('/', buyerAuth, async (c) => {
  try {
    const body = await c.req.json();
    const buyer = c.get('buyer');
    const result = await startPayment(c.env, {
      buyerId: buyer.id,
      items: [{ product_id: body.product_id, quantity: body.quantity }],
      contact: {
        contact_email: body.contact_email,
        contact_name: body.contact_name,
        address: body.address,
        phone: body.phone
      },
      clearCart: false,
      origin: requestOrigin(c)
    });
    return c.json(result);
  } catch (err) {
    const mapped = orderErrorMessage(err);
    if (mapped) return c.json({ error: mapped.error }, mapped.status);
    return c.json({ error: err.message || '下单失败' }, 400);
  }
});

orders.post('/checkout', buyerAuth, async (c) => {
  try {
    const body = await c.req.json();
    const buyer = c.get('buyer');
    const items = body.items || [];
    if (!items.length) return c.json({ error: '购物车为空' }, 400);
    const result = await startPayment(c.env, {
      buyerId: buyer.id,
      items,
      contact: {
        contact_email: body.contact_email,
        contact_name: body.contact_name,
        address: body.address,
        phone: body.phone
      },
      clearCart: true,
      origin: requestOrigin(c)
    });
    return c.json(result);
  } catch (err) {
    const mapped = orderErrorMessage(err);
    if (mapped) return c.json({ error: mapped.error }, mapped.status);
    return c.json({ error: err.message || '结算失败' }, 400);
  }
});

orders.get('/my', buyerAuth, async (c) => {
  const buyer = c.get('buyer');
  const rows = await all(c.env.DB, `
    ${ORDER_LIST_SELECT}
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = ?
    ORDER BY o.id DESC
  `, buyer.id);
  return c.json(rows.map(formatOrder));
});

orders.get('/admin/all', adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    ${ORDER_LIST_SELECT}, b.email AS buyer_email
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN buyers b ON o.buyer_id = b.id
    ORDER BY o.id DESC
  `);
  return c.json(rows.map(formatOrder));
});

orders.put('/:id/ship', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { shipping_number } = await c.req.json();
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ?', id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (order.status !== 'pending') return c.json({ error: '仅待发货订单可发货' }, 400);
  const { shippedAt, autoConfirmAt } = shippedTimestamps();
  await run(c.env.DB, `
    UPDATE orders SET status = 'shipped', shipping_number = ?, shipped_at = ?, auto_confirm_at = ?
    WHERE id = ?
  `, shipping_number || '', shippedAt, autoConfirmAt, id);
  return c.json({ message: '已发货' });
});

orders.put('/:id/cancel', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ?', id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (['cancelled', 'completed'].includes(order.status)) {
    return c.json({ error: '该订单不可取消' }, 400);
  }
  await refundOrder(c.env.DB, order, c.env);
  await run(c.env.DB, "UPDATE orders SET status = 'cancelled' WHERE id = ?", id);
  return c.json({ message: '订单已取消并退款' });
});

/** Permanently remove an order record only — no refund, no stock restore. */
orders.delete('/:id', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const order = await one(c.env.DB, 'SELECT id FROM orders WHERE id = ?', id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  await run(c.env.DB, 'DELETE FROM reviews WHERE order_id = ?', id);
  await run(c.env.DB, 'DELETE FROM orders WHERE id = ?', id);
  return c.json({ message: '订单已删除' });
});

orders.put('/:id/confirm', buyerAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const buyer = c.get('buyer');
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ? AND buyer_id = ?', id, buyer.id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (order.status !== 'shipped') return c.json({ error: '仅已发货订单可确认收货' }, 400);
  await run(c.env.DB, `
    UPDATE orders SET status = 'completed', confirmed_at = ? WHERE id = ?
  `, getSystemTimeISO(), id);
  return c.json({ message: '已确认收货' });
});

orders.post('/:id/return', buyerAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const buyer = c.get('buyer');
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ? AND buyer_id = ?', id, buyer.id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (!['shipped', 'completed'].includes(order.status)) {
    return c.json({ error: '当前状态不可申请退货' }, 400);
  }
  if (order.return_status === 'pending' || order.return_status === 'approved') {
    return c.json({ error: '已有退货申请' }, 400);
  }
  const body = await c.req.parseBody({ all: true });
  const reason = String(body.reason || '').trim();
  if (!reason) return c.json({ error: '请填写退货原因' }, 400);
  const files = [].concat(body.images || []).filter(f => f && typeof f === 'object' && f.arrayBuffer);
  const images = [];
  for (const file of files.slice(0, 5)) {
    images.push(await putUpload(c.env, file, { folder: 'returns' }));
  }
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'pending', return_reason = ?, return_images = ?, return_reject_reason = ''
    WHERE id = ?
  `, reason, JSON.stringify(images), id);
  return c.json({ message: '退货申请已提交' });
});

orders.put('/:id/return/approve', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ?', id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (order.return_status !== 'pending') return c.json({ error: '没有待处理的退货申请' }, 400);
  await refundOrder(c.env.DB, order, c.env);
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'approved', status = 'cancelled' WHERE id = ?
  `, id);
  return c.json({ message: '已同意退货并退款' });
});

orders.put('/:id/return/reject', adminAuth, async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { reason } = await c.req.json();
  const order = await one(c.env.DB, 'SELECT * FROM orders WHERE id = ?', id);
  if (!order) return c.json({ error: '订单不存在' }, 404);
  if (order.return_status !== 'pending') return c.json({ error: '没有待处理的退货申请' }, 400);
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'rejected', return_reject_reason = ? WHERE id = ?
  `, reason || '', id);
  return c.json({ message: '已拒绝退货' });
});

export default orders;
