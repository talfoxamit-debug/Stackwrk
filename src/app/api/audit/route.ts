import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

type CheckStatus = "pass" | "warn" | "fail";
type Check = { label: string; status: CheckStatus; detail: string };
type Category = { key: string; label: string; score: number; checks: Check[] };

const MAX_BYTES = 2_000_000; // cap HTML we read
const FETCH_TIMEOUT_MS = 9000;

/** Block obviously-private / local hosts (basic SSRF guard). */
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/:\d+$/, "");
  if (h === "localhost" || h.endsWith(".local") || h === "::1") return true;
  // IPv4 private / loopback / link-local / metadata ranges
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function normalizeUrl(raw: string): URL | null {
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (!u.hostname.includes(".")) return null; // require a TLD
    if (isBlockedHost(u.hostname)) return null;
    return u;
  } catch {
    return null;
  }
}

const has = (html: string, re: RegExp) => re.test(html);
const grab = (html: string, re: RegExp) => (html.match(re)?.[1] ?? "").trim();
const scoreOf = (checks: Check[]) =>
  Math.round(
    checks.reduce((s, c) => s + (c.status === "pass" ? 100 : c.status === "warn" ? 60 : 0), 0) /
      Math.max(checks.length, 1),
  );

export async function POST(req: Request) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const target = normalizeUrl(body.url ?? "");
  if (!target) {
    return NextResponse.json(
      { ok: false, error: "invalid_url", message: "Enter a valid website address (e.g. yoursite.com)." },
      { status: 422 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const started = Date.now();

  let res: Response;
  try {
    res = await fetch(target.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "StackwrkAuditBot/1.0 (+https://stackwrk.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    clearTimeout(timer);
    return NextResponse.json(
      {
        ok: false,
        error: "unreachable",
        message: "Couldn't reach that site — double-check the address and try again.",
      },
      { status: 502 },
    );
  }
  const ttfb = Date.now() - started;

  // Read up to MAX_BYTES of the body
  let html = "";
  try {
    const reader = res.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder();
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        html += decoder.decode(value, { stream: true });
        if (total >= MAX_BYTES) {
          await reader.cancel();
          break;
        }
      }
      html += decoder.decode();
    } else {
      html = await res.text();
    }
  } catch {
    html = "";
  }
  clearTimeout(timer);

  const loadMs = Date.now() - started;
  const finalUrl = res.url || target.toString();
  const isHttps = finalUrl.startsWith("https://");
  const pageKb = Math.max(1, Math.round(new TextEncoder().encode(html).length / 1024));

  const title = grab(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDesc = grab(html, /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i);
  const hasViewport = has(html, /<meta[^>]+name=["']viewport["']/i);
  const hasH1 = has(html, /<h1[\s>]/i);
  const hasFavicon = has(html, /<link[^>]+rel=["'][^"']*icon[^"']*["']/i);
  const hasOg = has(html, /<meta[^>]+property=["']og:(title|image)["']/i);
  const imgCount = (html.match(/<img[\s>]/gi) || []).length;
  const imgNoAlt = (html.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length;

  const bookingSignal = has(
    html,
    /calendly|cal\.com|acuity|squarespace-scheduling|book\s*(now|a|an|your)|appointment|schedule\s*(a|your|now)|reserve|booking/i,
  );
  const contactSignal = has(html, /mailto:|tel:|href=["'][^"']*contact/i);
  const ctaSignal = has(
    html,
    /get\s*started|book\s*(now|a)|buy\s*now|sign\s*up|contact\s*us|get\s*a\s*quote|shop\s*now|order\s*(now|online)|add\s*to\s*cart/i,
  );
  const analyticsSignal = has(html, /googletagmanager|google-analytics|gtag\(|plausible|fathom|posthog|fbq\(/i);

  const speed: Check[] = [
    {
      label: "Server response time",
      status: ttfb < 800 ? "pass" : ttfb < 2000 ? "warn" : "fail",
      detail: `First byte in ${ttfb} ms${ttfb >= 800 ? " — faster is better" : ""}`,
    },
    {
      label: "HTML page weight",
      status: pageKb < 500 ? "pass" : pageKb < 1500 ? "warn" : "fail",
      detail: `${pageKb} KB of HTML${pageKb >= 500 ? " — heavier pages load slower on phones" : ""}`,
    },
    {
      label: "Image discipline",
      status: imgCount === 0 ? "warn" : imgNoAlt / Math.max(imgCount, 1) < 0.3 ? "pass" : "warn",
      detail:
        imgCount === 0
          ? "No images detected"
          : `${imgCount} images${imgNoAlt ? `, ${imgNoAlt} missing alt text` : ", well-tagged"}`,
    },
  ];

  const mobile: Check[] = [
    {
      label: "Mobile viewport tag",
      status: hasViewport ? "pass" : "fail",
      detail: hasViewport ? "Scales correctly on phones" : "Missing — the page won't fit small screens",
    },
    {
      label: "Secure connection (HTTPS)",
      status: isHttps ? "pass" : "fail",
      detail: isHttps ? "Padlock shown to visitors" : "No HTTPS — browsers flag this as 'Not secure'",
    },
  ];

  const seo: Check[] = [
    {
      label: "Page title",
      status: title ? (title.length >= 10 && title.length <= 65 ? "pass" : "warn") : "fail",
      detail: title ? `“${title.slice(0, 60)}”` : "No <title> — hurts search rankings",
    },
    {
      label: "Meta description",
      status: metaDesc ? (metaDesc.length >= 50 && metaDesc.length <= 165 ? "pass" : "warn") : "fail",
      detail: metaDesc ? `${metaDesc.length} chars` : "Missing — Google writes its own, often badly",
    },
    {
      label: "Single clear headline (H1)",
      status: hasH1 ? "pass" : "warn",
      detail: hasH1 ? "Found an H1" : "No H1 — search engines can't tell the main topic",
    },
    {
      label: "Social share preview",
      status: hasOg ? "pass" : "warn",
      detail: hasOg ? "Open Graph tags present" : "No preview image when shared on social/WhatsApp",
    },
  ];

  const conversion: Check[] = [
    {
      label: "Online booking / scheduling",
      status: bookingSignal ? "pass" : "fail",
      detail: bookingSignal ? "Visitors can book you directly" : "No way to book — you're losing after-hours leads",
    },
    {
      label: "Clear call-to-action",
      status: ctaSignal ? "pass" : "warn",
      detail: ctaSignal ? "Found action buttons" : "No obvious next step for visitors",
    },
    {
      label: "Easy to contact",
      status: contactSignal ? "pass" : "warn",
      detail: contactSignal ? "Phone/email/contact link present" : "Hard to find how to reach you",
    },
    {
      label: "Visitor analytics",
      status: analyticsSignal ? "pass" : "warn",
      detail: analyticsSignal ? "You're measuring traffic" : "No analytics — you're flying blind",
    },
  ];

  const categories: Category[] = [
    { key: "speed", label: "Speed", score: scoreOf(speed), checks: speed },
    { key: "mobile", label: "Mobile", score: scoreOf(mobile), checks: mobile },
    { key: "seo", label: "SEO", score: scoreOf(seo), checks: seo },
    { key: "conversion", label: "Conversion", score: scoreOf(conversion), checks: conversion },
  ];
  const score = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);

  const headline =
    score >= 85
      ? "Strong site — a few tweaks and it'll really convert."
      : score >= 65
        ? "Solid base, but you're leaving leads on the table."
        : score >= 40
          ? "Real gaps here — this is costing you customers."
          : "This site is actively working against you. Let's fix it.";

  return NextResponse.json({
    ok: true,
    url: target.toString(),
    finalUrl,
    score,
    loadMs,
    pageKb,
    categories,
    headline,
  });
}
