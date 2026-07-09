# Stackwrk — Conversion Build Plan

Living plan for turning stackwrk.com into a high-converting lead-gen site for a
web-development service. **Order-independent — every phase below gets built.**
This file is the source of truth for scope + status; it's updated as work lands.

---

## Purpose

stackwrk.com is not a brochure — it's a **conversion machine** with one job:
turn a cold-email click into a booked "free site audit" call.

**Funnel:** cold email ("I can build you a website") → prospect clicks → lands on
stackwrk.com (usually on their phone, skeptical) → sees proof + wants it →
books an audit.

**In ~8 seconds the site must answer:** (1) *Is this person actually good?* — the
site itself is the proof. (2) *Will this make me money?* — sell outcomes, not
code. (3) *Is this about me?* — relevance/personalization.

---

## Phases (all required; order does not matter)

Status key: ☐ todo · ◐ in progress · ☑ done

### Phase 1 — Instant Site Audit tool ⭐ (flagship) — ☑ DONE
The best cold-email weapon: visitor enters their URL → live scorecard →
"here's what I'd fix." Gives free value, proves expertise, creates the gap.
- ☑ `POST /api/audit` — fetches the URL server-side & analyzes (HTTPS, TTFB, title,
  meta description, viewport/mobile, H1, favicon, image weight/alt, booking/CTA/
  contact/analytics signals, page size). SSRF-safe (http/https only, 9s timeout,
  2 MB cap, blocks private/local hosts). `src/app/api/audit/route.ts`
- ☑ Audit UI: URL input → loading → animated scorecard (Speed / Mobile / SEO /
  Conversion) with a score ring, per-category bars, pass/warn/fail checks, and a
  "Get my free audit" CTA → #about. `AuditTool.tsx` + `AuditSection.tsx`
- ☑ Wired into the page (`#audit`, after Featured Projects). Verified live against
  real sites (seatophomes.com → 94, example.com → 74).

### Phase 2 — Interactive demo showcase
"See what I can build" — live, touchable mini-tools so prospects think *"I want
that on my site."*
- ☐ Booking / availability widget (date + time-slot picker)
- ☐ ROI / price calculator (inputs → live result)
- ☐ AI-style chatbot demo (scripted, feels smart)
- ☐ Before/after redesign slider (drag to compare)
- ☐ Showcase section wrapping the demos (tabbed)

### Phase 3 — Proof & results upgrade
- ☐ Project cards → outcome metrics (results, not features)
- ☐ Testimonials section
- ☐ "How it works" 3-step (Audit → Build → Launch)
- ☐ Risk-reversal guarantee callout

### Phase 4 — Mobile conversion polish
- ☐ Sticky "Book a free audit" bar on mobile (appears on scroll)
- ☐ Tighter CTA flow
- ☐ Per-industry angle hook

---

## Needs real data from Tal (placeholders used until provided)

- **Supabase**: no Stackwrk project exists yet (only YatHub / FoxStays Docks).
  Decide: new project or reuse. Then add `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
  to Vercel env (dashboard-only). Form degrades gracefully until then.
- **Calendly URL** — real link for the secondary "Book on Calendly".
- **Testimonials** — name, company, quote (photo/video ideal).
- **Result metrics** per project (e.g. "+40% bookings").
- **Project screenshots** (optional) to replace generated mockups.

---

## Deployment / coordination

- `main` is the Vercel **production branch** → deploys to **stackwrk.com**.
- Two agents edit this repo (codex = visuals, Claude = functionality). Always
  `git pull` before push; keep changes modular to avoid clobbering.
