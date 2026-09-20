import Stripe from 'stripe';

export const CURRENCY = 'hkd';

export function getStripe(env) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY 未配置');
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2024-11-20.acacia'
  });
}

/** HKD dollars → Stripe integer cents */
export function toStripeAmount(hkd) {
  return Math.max(0, Math.round(Number(hkd) * 100));
}

export function fromStripeAmount(cents) {
  return Number(cents || 0) / 100;
}

export async function createCheckoutSession(env, {
  lineItems,
  successUrl,
  cancelUrl,
  clientReferenceId,
  metadata = {}
}) {
  const stripe = getStripe(env);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    // Follow Dashboard-enabled methods (card, Alipay, …). Do not hardcode card-only.
    payment_method_types: ['card', 'alipay'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(clientReferenceId),
    metadata,
    locale: 'zh'
  });
  return session;
}

export async function constructWebhookEvent(env, rawBody, signature) {
  const stripe = getStripe(env);
  const secret = env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET 未配置');
  return stripe.webhooks.constructEventAsync(rawBody, signature, secret);
}

export async function refundStripePayment(env, paymentIntentId, amountHkd) {
  if (!paymentIntentId || !(amountHkd > 0)) return null;
  const stripe = getStripe(env);
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: toStripeAmount(amountHkd)
  });
}

export async function getSessionPaymentIntent(env, sessionId) {
  const stripe = getStripe(env);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session.payment_intent || null;
}
