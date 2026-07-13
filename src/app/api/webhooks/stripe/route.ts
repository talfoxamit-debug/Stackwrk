import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Stripe webhook. Verifies the signature, then records key payment events so the
 * business has a durable log even if the browser redirect is lost. Best practice:
 * always verify the signature and respond 200 fast.
 *
 * Set up: Stripe Dashboard → Developers → Webhooks → add endpoint
 *   URL:    https://stackwrk.com/api/webhooks/stripe
 *   Events: checkout.session.completed, invoice.paid, invoice.payment_failed
 * Copy the signing secret (whsec_…) into STRIPE_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig || "", secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bad_signature";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  // Extract a compact record for the events we care about.
  let record: { type: string; email: string | null; amount: number | null; status: string } | null = null;
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as { customer_details?: { email?: string }; customer_email?: string; amount_total?: number; mode?: string };
    record = { type: `checkout.${s.mode}`, email: s.customer_details?.email ?? s.customer_email ?? null, amount: s.amount_total ?? null, status: "paid" };
  } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
    const inv = event.data.object as { customer_email?: string; amount_paid?: number; amount_due?: number };
    record = { type: event.type, email: inv.customer_email ?? null, amount: (inv.amount_paid ?? inv.amount_due) ?? null, status: event.type === "invoice.paid" ? "paid" : "failed" };
  }

  if (record) {
    const sb = getSupabaseAdmin();
    if (sb) {
      await sb.from("payments").insert({
        id: event.id,
        type: record.type,
        email: record.email,
        amount_cents: record.amount,
        status: record.status,
        created_at: new Date().toISOString(),
      }).then(() => {}, () => {}); // table optional; ignore if it doesn't exist
    }
  }

  return NextResponse.json({ received: true });
}
