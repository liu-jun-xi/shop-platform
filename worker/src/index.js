import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ensureSeed } from './seed.js';
import { runAutoConfirmOrders } from './utils/orderHelpers.js';
import { getUploadObject, urlToKey } from './storage.js';
import admin from './routes/admin.js';
import buyers from './routes/buyers.js';
import products from './routes/products.js';
import orders from './routes/orders.js';
import cart from './routes/cart.js';
import comments from './routes/comments.js';
import reviews from './routes/reviews.js';
import messages from './routes/messages.js';
import site from './routes/site.js';
import categories from './routes/categories.js';
import stripeWebhook from './routes/stripeWebhook.js';

const app = new Hono();

app.use('*', cors());

app.use('/api/*', async (c, next) => {
  try {
    await ensureSeed(c.env.DB);
  } catch (err) {
    console.error('seed error', err);
  }
  await next();
});

app.route('/api/admin', admin);
app.route('/api/buyers', buyers);
app.route('/api/products', products);
app.route('/api/orders', orders);
app.route('/api/cart', cart);
app.route('/api/comments', comments);
app.route('/api/reviews', reviews);
app.route('/api/messages', messages);
app.route('/api/site', site);
app.route('/api/categories', categories);
app.route('/api/stripe', stripeWebhook);

app.get('/uploads/*', async (c) => {
  const path = c.req.path.replace(/^\/uploads\//, '');
  const key = urlToKey(`/uploads/${path}`) || path;
  const obj = await getUploadObject(c.env, key);
  if (!obj) return c.json({ error: '文件不存在' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=86400');
  return new Response(obj.body, { headers });
});

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: '接口不存在' }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || '服务器内部错误' }, 500);
});

export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },
  async scheduled(_event, env, _ctx) {
    try {
      await ensureSeed(env.DB);
      const n = await runAutoConfirmOrders(env.DB);
      if (n) console.log(`Auto-confirmed ${n} orders`);
    } catch (err) {
      console.error('cron error', err);
    }
  }
};
