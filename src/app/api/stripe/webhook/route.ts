import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { requireStripe } from "@/lib/stripe";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
// Stripe needs the raw body for signature verification.
export const runtime = "nodejs";

function mapStatus(status: Stripe.Subscription.Status): "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" {
  switch (status) {
    case "trialing": return "TRIALING";
    case "active": return "ACTIVE";
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELED";
    default: return "INCOMPLETE";
  }
}

export async function POST(req: NextRequest) {
  const stripe = requireStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn("Invalid Stripe webhook signature", { error: String(err) });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: mapStatus(sub.status),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        break;
      }
      default:
        logger.debug("Unhandled Stripe event", { type: event.type });
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error("Stripe webhook processing failed", { error: String(err) });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
