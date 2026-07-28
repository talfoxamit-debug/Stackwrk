import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { notifyTelegram, leadAlert } from "@/lib/telegram";

export const runtime = "nodejs";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clamp = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Newsletter signup. Stored in the same `leads` table with source
 * "newsletter" rather than a separate table, so subscribers show up in the
 * one place Tal already works and no migration is needed.
 *
 * The leads table requires a name, but a newsletter form should only ever ask
 * for an email (every extra field costs signups), so the email's local part is
 * used as the display name. That keeps the CRM readable without asking for
 * something we do not need.
 */
export async function POST(req: Request) {
  if (!rateLimit(`subscribe:${getClientIp(req)}`, 8, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", message: "Too many attempts. Please wait a minute." },
      { status: 429 },
    );
  }

  let body: { email?: string; company?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: accept silently so bots do not learn, but never store.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const email = clamp(body.email, 200);
  if (!emailRe.test(email)) {
    return NextResponse.json(
      { ok: false, error: "validation", message: "Please enter a valid email address." },
      { status: 422 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  // Do not create a duplicate row if this address already subscribed. Any
  // lookup failure falls through to the insert: a duplicate subscriber is a far
  // better outcome than a dropped one.
  const { data: existing } = await supabase
    .from("leads")
    .select("id")
    .eq("email", email)
    .eq("source", "newsletter")
    .maybeSingle();

  if (existing) return NextResponse.json({ ok: true, already: true });

  const { error } = await supabase.from("leads").insert({
    name: email.split("@")[0].slice(0, 120),
    email,
    source: clamp(body.source, 60) || "newsletter",
    message: "Subscribed to the newsletter.",
  });

  if (error) {
    console.error("[subscribe] insert failed:", error.message);
    return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
  }

  void notifyTelegram(
    leadAlert({ title: "New newsletter subscriber", email, source: "newsletter" }),
  );

  return NextResponse.json({ ok: true });
}
