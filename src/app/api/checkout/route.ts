import { NextResponse } from "next/server";
import { getStripe, siteOrigin } from "@/lib/stripe";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Create a Stripe Checkout Session and return its URL.
 * Body:
 *   { kind: "deposit", amount, label, email?, client? }        : one-time payment
 *   { kind: "care", monthly, plan, email? }                    : monthly subscription
 * amount / monthly are in whole US dollars.
 */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${getClientIp(req)}`, 10, 60_000)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  let b: {
    kind?: "deposit" | "care";
    amount?: number; label?: string; client?: string;
    monthly?: number; plan?: string; email?: string;
    ref?: string;
    utm?: { utm_source?: string; utm_medium?: string; utm_campaign?: string; referrer?: string };
  };
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: "bad" }, { status: 400 }); }

  const origin = siteOrigin(req);
  const email = b.email && /.+@.+\..+/.test(b.email) ? b.email : undefined;

  // Channel attribution: attach UTM as session metadata and a client reference
  // so a payment can be joined back to a lead and its acquisition channel.
  const clientReferenceId = (b.ref || email || "").slice(0, 200) || undefined;
  const metadata: Record<string, string> = {};
  if (b.utm?.utm_source) metadata.utm_source = String(b.utm.utm_source).slice(0, 120);
  if (b.utm?.utm_medium) metadata.utm_medium = String(b.utm.utm_medium).slice(0, 120);
  if (b.utm?.utm_campaign) metadata.utm_campaign = String(b.utm.utm_campaign).slice(0, 160);
  if (b.utm?.referrer) metadata.referrer = String(b.utm.referrer).slice(0, 300);

  try {
    let session;
    if (b.kind === "care") {
      const monthly = Math.round(Number(b.monthly));
      if (!monthly || monthly < 1) return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 422 });
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        client_reference_id: clientReferenceId,
        metadata,
        subscription_data: { metadata },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: { name: `Stackwrk Care Plan: ${b.plan || "Growth"}` },
            unit_amount: monthly * 100,
            recurring: { interval: "month" },
          },
        }],
        success_url: `${origin}/agreement/paid?type=care`,
        cancel_url: `${origin}/`,
        allow_promotion_codes: true,
      });
    } else {
      const amount = Math.round(Number(b.amount));
      if (!amount || amount < 1) return NextResponse.json({ ok: false, error: "bad_amount" }, { status: 422 });
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        client_reference_id: clientReferenceId,
        metadata,
        line_items: [{
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: { name: `Deposit: ${b.label || "Website project"}${b.client ? ` (${b.client})` : ""}` },
            unit_amount: amount * 100,
          },
        }],
        payment_intent_data: { description: `Website deposit${b.client ? ` for ${b.client}` : ""}`, metadata },
        success_url: `${origin}/agreement/paid?type=deposit`,
        cancel_url: `${origin}/agreement`,
      });
    }
    return NextResponse.json({ ok: true, url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "stripe_error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
