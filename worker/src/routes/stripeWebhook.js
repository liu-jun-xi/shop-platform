import { Hono } from 'hono';
import { constructWebhookEvent } from '../stripe.js';
import { completeCheckoutFromStripe, releaseCheckoutHold } from '../checkout.js';

const stripeWebhook = new Hono();

stripeWebhook.post('/webhook', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) return c.json({ error: 'Missing stripe-signature' }, 400);

  let event;
  try {
    const rawBody = await c.req.text();
    event = await constructWebhookEvent(c.env, rawBody, signature);
  } catch (err) {
    console.error('Stripe webhook verify failed', err);
    return c.json({ error: `Webhook Error: ${err.message}` }, 400);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      await completeCheckoutFromStripe(c.env, event.data.object);
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      await releaseCheckoutHold(c.env, event.data.object);
    }
  } catch (err) {
    console.error('Stripe webhook handler failed', err);
    return c.json({ error: err.message || 'Handler failed' }, 500);
  }

  return c.json({ received: true });
});

export default stripeWebhook;
