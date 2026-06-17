import Stripe from "stripe";
import { env } from "@/env";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error("Stripe is not configured");
  return stripe;
}

/** Creates (or reuses) a Stripe customer and a checkout session for a plan. */
export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ url: string | null }> {
  const client = requireStripe();
  const session = await client.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: params.priceId, quantity: 1 }],
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
    allow_promotion_codes: true,
  });
  return { url: session.url };
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const client = requireStripe();
  const session = await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}
