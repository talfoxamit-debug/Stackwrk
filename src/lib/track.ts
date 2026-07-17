import { track as vercelTrack } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

/**
 * Fire a named conversion/interaction event. Thin wrapper over Vercel Analytics
 * custom events, made a safe no-op if analytics is unavailable so a tracking
 * call can never break a funnel. Use for funnel success paths (lead_submitted,
 * audit_completed, mockup_requested) and key CTA clicks (calendly_click).
 */
export function track(event: string, props?: Props): void {
  try { vercelTrack(event, props); } catch { /* analytics blocked / unavailable */ }
}
