/**
 * Channel attribution capture. On the first page a visitor lands on, we record
 * the UTM params and external referrer into sessionStorage (first touch wins),
 * so whichever form they eventually submit can attach where they actually came
 * from. Without this every lead lands with a generic source and paid / cold
 * outreach spend cannot be attributed.
 */

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing_path?: string;
};

const KEY = "swrk_attr";
const cap = (s: string, n: number) => s.slice(0, n);

/** Record attribution once per session (first touch). Safe to call on every load. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(KEY)) return; // first touch wins
    const p = new URLSearchParams(window.location.search);
    const attr: Attribution = {};
    const src = p.get("utm_source"); if (src) attr.utm_source = cap(src, 120);
    const med = p.get("utm_medium"); if (med) attr.utm_medium = cap(med, 120);
    const camp = p.get("utm_campaign"); if (camp) attr.utm_campaign = cap(camp, 160);
    const ref = document.referrer;
    if (ref && !ref.includes(window.location.host)) attr.referrer = cap(ref, 300);
    attr.landing_path = cap(window.location.pathname, 200);
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch { /* storage blocked: attribution is best-effort */ }
}

/** Read the captured attribution (empty object if none / unavailable). */
export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}") as Attribution; } catch { return {}; }
}
