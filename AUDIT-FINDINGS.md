# Stackwrk Audit Findings

> Companion to AUDIT-PLAN.md. Generated 2026-07-17 by the audit run: 12 domains, each discovered by one agent and independently verified by a separate adversarial agent that had to reproduce or refute every finding. Findings only; nothing was fixed.
>
> 177 findings: 4 critical, 23 high, 88 medium, 62 low.
> Verdicts: 49 CONFIRMED (reproduced), 122 CONFIRMED-STATIC (proven by code evidence), 2 PLAUSIBLE, 2 NEEDS-DYNAMIC-VERIFICATION, 2 NEEDS-OWNER-VERIFICATION.

**Verdict legend.** CONFIRMED: independently reproduced (often with a runnable snippet). CONFIRMED-STATIC: proven from the code itself (no runtime needed). PLAUSIBLE: strong evidence, not fully reproduced. NEEDS-DYNAMIC-VERIFICATION: needs a running deploy to confirm the live blast radius. NEEDS-OWNER-VERIFICATION: needs a dashboard/env only Tal can see (Vercel, Stripe, Resend, Supabase, Search Console).

---

## Executive summary

This audit spanned ten domains across the Stackwrk marketing site and internal CRM and produced a large set of file-grounded, reproduced findings. Four confirmed criticals dominate: a forgeable full-CRM login minted from a repo-committed fallback secret (SEC-01), silent whole-pipeline data loss in the shared team CRM (DATA-04), and a complete absence of both a page-view tag and any channel attribution (ANALYTICS-01, ANALYTICS-03) on a business that plans paid and cold-outreach spend. Below the criticals the same root causes recur. One reused secret doubles as the session-signing key, the master API key, and a value persisted in browser storage and accepted in a URL query string (SEC-01, SEC-02, SEC-10, CODE-03). Public POST endpoints have no rate limiting (REL-03, SEC-03, SEC-08, SEC-09). Best-effort external writes swallow errors and return 200, so provider retries never fire (DATA-06, REL-17, CODE-10). The Quo webhook corrupts call status and bypasses its own allowlist on common payload shapes (DATA-01, DATA-02, DATA-03). Pricing, delivery-timeline, and testimonial copy disagree across the live site, the binding e-sign agreement, and the playbooks (GTM-01, GTM-13, CONTENT-03, CONTENT-09). Several highs are activation blockers rather than code bugs: with Resend, Supabase, or Stripe unconfigured, lead capture and email delivery silently no-op while the UI still claims delivery (GTM-02, GTM-03, CONV-02). No lint or test gate protects the auto-deploying main branch (CODE-01, CODE-02). Net: a small number of security and data-integrity fixes plus the analytics baseline should land before any real traffic, followed by the pricing, trust-copy, and CAN-SPAM/privacy cleanups before cold outreach begins.

## Ship-blockers (fix these first)

- **SEC-01: CRM session HMAC falls back to a repo-committed public secret when CRM_ACCESS_KEY is unset.** Anyone who knows a username forges a valid crm_session cookie and gets full read/write CRM access with no password (REL-05 is the same defect).
- **DATA-04: team_crm shared pipeline is a wholesale last-write-wins upsert.** A single transient GET failure or a second open editor silently replaces the entire prospect pipeline and resets export/scan stamps, with no versioning to recover (REL-01, REL-11 overlap).
- **ANALYTICS-03: No UTM/referrer/click-id capture; lead source is a hardcoded per-form literal.** On a paid-spend and cold-email business, every lead lands with a generic label so no channel can be attributed and spend is flown blind; there are not even columns to store attribution.
- **ANALYTICS-01: No web analytics tag of any kind on the public site.** Zero page-view instrumentation and no analytics dependency, so traffic, top pages, and funnel drop-off are entirely uncounted (CONV-10 is the same gap).

## Quick wins (high impact, low effort)

- **SEC-01: Remove the hardcoded crm-auth fallback secret and fail closed (503) when CRM_ACCESS_KEY is unset.** Effort: small (a few lines in crm-auth.ts).
- **CONV-01: Fix the dead care-plan CTA on /pricing: change bare #audit to /#audit.** Effort: trivial (one string, Plans.tsx lines 71 and 79).
- **CONTENT-03: Delete the live placeholder testimonial card (name 'Client', TODO stub) to remove FTC/fabricated-review exposure.** Effort: trivial (remove testimonials[2] in content.ts).
- **SEC-02: Drop the ?key= query-param auth path on /api/leads so the master secret cannot leak into logs, history, and Referer.** Effort: small (delete one clause in authorized(); CODE-03 same).
- **GTM-08: Replace the seatophomes Calendly URL and the bare linkedin.com/github.com social links with real Stackwrk profiles.** Effort: small (single constants in content.ts; also fixes CONTENT-12, SEO-13).
- **ANALYTICS-01: Add one page-view tag in layout.tsx (Vercel Web Analytics or GA4 via next/script).** Effort: small (one component plus a NEXT_PUBLIC id).
- **CONV-02: Gate the AuditPopup 'your audit is on its way' copy on the actual emailed flag instead of showing success unconditionally.** Effort: small (read the audit-report response; ties to GTM-02).
- **DATA-12: Fix SOFLA_AREA_CODES: replace unassigned 472 with the 561/Palm Beach overlay 728 after a NANPA cross-check.** Effort: trivial (one array edit in prospects.ts).
- **SEO-01: Give /privacy and /terms their own canonical and add them to the sitemap.** Effort: small (per-page alternates plus two sitemap entries; SEO-10).

## Recurring themes

- Single reused secret: the same value signs CRM sessions, is the master /api/leads key, is accepted in a URL query string, and is stored in browser sessionStorage (SEC-01, SEC-02, SEC-10, SEC-15, CODE-03, REL-05)
- No rate limiting on any public POST endpoint; only /api/sign throttles and it keys on a spoofable x-forwarded-for (REL-03, SEC-03, SEC-08, SEC-09, REL-12)
- Shared team_crm is wholesale last-write-wins with silent save failures and no confirmed-load gate (DATA-04, REL-01, REL-04, REL-11, DATA-16, CODE-11)
- Best-effort webhook/DB writes swallow every error and return 200, turning retryable failures into permanent silent loss (DATA-06, REL-17, CODE-10)
- Quo webhook data integrity: enrichment overwrites call status/occurred_at, drops events without participant numbers, and bypasses the allowlist when phoneNumber is absent (DATA-01, DATA-02, DATA-03, SEC-07)
- SSRF defense-in-depth gaps: mapped-IPv6 classification miss, DNS-rebinding TOCTOU, unguarded robots fetch, unbounded DNS lookup (SEC-04, SEC-05, REL-08)
- Zero measurement across the whole funnel: no page-view tag, no conversion events, no attribution, unmeasured Calendly/Instantly/Stripe/Meta channels (ANALYTICS-01 to ANALYTICS-07, CONV-10)
- Pricing and delivery-timeline incoherence across the live site, the binding agreement, and the playbooks (GTM-01, GTM-04, GTM-13, GTM-14, GTM-15, GTM-17, GTM-21, CONV-03, CONV-13, CONTENT-09, CODE-08)
- Placeholder and draft content shipped live: fabricated testimonial, bare social URLs, seatophomes Calendly, empty care checkout (CONTENT-03, CONTENT-12, GTM-08, GTM-12, CONV-07, SEO-13, CONV-11, GTM-07)
- Broken-promise and trust copy: success shown when nothing sent, overstated guarantee, 'Lighthouse-grade' and unsourced ROI claims (CONV-02, GTM-02, CONTENT-04, CONTENT-10, CONTENT-11, GTM-21)
- CAN-SPAM and privacy-disclosure gaps: missing postal address and opt-out in templates and report email, undisclosed Quo/Instantly subprocessors, deceptive re: subject lines (CONTENT-05, CONTENT-06, CONTENT-08, CONTENT-13, GTM-11, SEC-13)
- Modal accessibility: AuditPopup, MockupModal, and CRM overlays lack Escape, focus trap, initial/restore focus, scroll lock, and accessible names (A11Y-02, A11Y-03, A11Y-07, A11Y-09, CONV-09, MOBILE-01)
- Contrast failures site-wide: low-opacity white body text and CRM tokens/borders below WCAG minimums (A11Y-01, A11Y-10, A11Y-12)
- Duplication and no single source of truth: cookie parse, email regex, money(), phone/domain helpers, and price tables reimplemented and drift-prone (CODE-06, CODE-07, CODE-08, CODE-15, CODE-16, GTM-04)
- No static or test gate on auto-deploying main: ESLint unconfigured and zero tests over money/auth/PII/SSRF logic (CODE-01, CODE-02)
- Image delivery: no next/image, no AVIF/responsive variants, eager decorative foxes on display:none, no caching or preload (PERF-01 to PERF-05, PERF-10)
- Activation blockers: with Resend/Supabase/Stripe env unset, capture and delivery silently no-op while the UI claims success (GTM-02, GTM-03, GTM-07, CONV-02, CONV-11)
- House-style breaches: en dashes across 27 files including user-facing copy, plus mixed apostrophes and dash-laden cold-email list (CONTENT-01, CONTENT-02, CONTENT-15, GTM-18)

## Duplicates merged

- REL-05 -> SEC-01: identical crm-auth hardcoded fallback secret / forgeable crm_session
- REL-01 and REL-11 -> DATA-04: same team_crm wholesale last-write-wins and transient-GET overwrite of the shared pipeline
- CONV-10 -> ANALYTICS-01: same 'no analytics tag anywhere' gap
- DATA-07 and REL-16 and SEC-06 -> SEC-06: legacy Quo webhook signature has no timestamp/replay window
- DATA-03 and REL-15 -> SEC-07: QUO_ALLOWED_NUMBERS allowlist bypassed when context.phoneNumber is absent
- REL-17 and CODE-10 -> DATA-06: best-effort webhook/Stripe DB writes swallow all errors and return 200
- REL-18 and CONV-03 -> CONV-03: /api/checkout bills a client-supplied amount validated only against NaN/<1 (SEC-08 covers the broader unauth + unbounded-string angle)
- CODE-03 -> SEC-02: /api/leads accepts the master key via ?key= query param
- CONV-11 -> GTM-07: care-plan subscription has no self-serve start path (kind:care branch unreachable)
- GTM-12 and CONV-07 -> CONTENT-03: placeholder/draft testimonials rendered live with hardcoded 5-star ratings
- CONV-13 -> CONTENT-09: delivery-timeline copy inconsistency (GTM-13 remains distinct as the 10-vs-14-business-day contract contradiction)
- CONV-09 -> A11Y-02: AuditPopup missing Escape/focus trap/scroll lock (MOBILE-01 remains distinct as the no-internal-scroll clipping case)
- SEO-13 overlaps CONTENT-12/GTM-08: placeholder social URLs also flow into JSON-LD sameAs
- ANALYTICS-10 overlaps SEO-11: build-time lastModified and uniform guide dates weaken freshness

## Notes

Ship-blockers are scoped to the four confirmed criticals per the brief. The two analytics criticals (ANALYTICS-01, ANALYTICS-03) are blind-spend and measurement blockers rather than functional breakage: the site works, but paid and cold-outreach spend cannot be attributed. Treat them as must-fix-before-traffic, and land them alongside SEC-01 and DATA-04. A second tier should gate a real launch and the start of cold email even though each is rated high, not critical: fabricated/unconsented testimonials live on the homepage (CONTENT-03, GTM-12), the 10-vs-14-business-day promise-vs-contract contradiction (GTM-13), the playbook prices that undercut the binding agreement (GTM-01), and the activation blockers where capture/delivery silently no-op while the UI claims success (GTM-02, GTM-03). Several items are NEEDS-OWNER-VERIFICATION and depend on Tal confirming production config in Vercel/Supabase/Resend/Stripe rather than on more code review: the live exploitability of SEC-01 (CRM_ACCESS_KEY unset while CRM_USERS set), the Quo contact dedup contract (DATA-10), live RLS on the Stackwrk Supabase project (DATA-11), and whether Resend/Supabase/Stripe are actually wired (GTM-02, GTM-03). Sequencing recommendation: (1) SEC-01, SEC-02, remove key-in-URL and sessionStorage secret; (2) DATA-04 confirmed-load gate plus optimistic concurrency; (3) analytics + attribution baseline; (4) the low-effort trust/copy quick wins (CONV-01, CONTENT-03, GTM-08); (5) CAN-SPAM/privacy and pricing coherence before any outreach send; (6) add a lint+test gate (CODE-01, CODE-02) so these do not regress on the auto-deploying main branch.

---

## Findings register

Grouped by domain, most severe first within each domain.

### 1. Security & Privacy

_16 findings: 1 critical, 2 high, 9 medium, 4 low._

#### `SEC-01` CRM session HMAC uses a hardcoded fallback secret, forgeable full-CRM login with no password

**CRITICAL** · CONFIRMED · auth · `src/lib/crm-auth.ts:9`

- **Reproduction:** Node harness (scratchpad/sec01_crm_forge.mjs) with verbatim makeToken/verifyToken. Run: CRM_USERS="tal:supersecretpassword|othman:x" node sec01_crm_forge.mjs (CRM_ACCESS_KEY unset).
- **Observed vs expected:** Observed: token minted from the public source constant is accepted and returns 'tal' with no password. Expected: missing signing secret must fail closed.
- **Verifier note:** Reproduced. With CRM_ACCESS_KEY unset and CRM_USERS set, SECRET resolves to the public source literal 'stackwrk-crm-dev-secret'; a token forged from that constant (dGFs.JSKdp6CDLqEXoNYKghD1gM0N_A56Q1BxmshJmXarePw) makes verifyToken return 'tal'. Control run with a real CRM_ACCESS_KEY returns null. The fail-open hardcoded-secret design is an unconditional defect and is critical on its own. The live exploit additionally requires prod to actually run with CRM_ACCESS_KEY unset while CRM_USERS is set: that env precondition is the one piece needing owner confirmation of the Vercel dashboard (NEEDS-OWNER-VERIFICATION for the live-misconfig state), but the forgeable-secret code behavior is fully confirmed.

#### `SEC-02` /api/leads accepts the master CRM key via ?key= query param with a non-constant-time comparison

**HIGH** · CONFIRMED-STATIC · auth · `src/app/api/leads/route.ts:25`

- **Reproduction:** Read authorized() at leads/route.ts:21-26. GET /api/leads?key=THEKEY would authorize; the key then appears in access logs and Referer.
- **Observed vs expected:** Observed: master secret accepted in the URL and compared with plain ===. Expected: header-only, timingSafeEqual, distinct from the session-signing secret.
- **Verifier note:** Confirmed by reading authorized(): key accepted via url.searchParams.get('key') and compared with variable-time ===, and the key is process.env.CRM_ACCESS_KEY, the same value crm-auth.ts:9 signs sessions with. The URL-query acceptance is the real risk: the secret leaks into Vercel/CDN access logs, browser history, and the Referer header, and because it doubles as the session-signing secret, leaking it also enables session forgery per SEC-01. The === timing side-channel is a genuine but largely theoretical remote channel on a high-entropy secret; the log-leak coupling carries the severity. Kept at high.

#### `SEC-03` /api/audit is unauthenticated and unrate-limited, arbitrary server-side fetch + cost/amplification DoS

**HIGH** · CONFIRMED-STATIC · ssrf-dos · `src/app/api/audit/route.ts:44`

- **Reproduction:** Read audit/route.ts in full; grep for verifyToken/CRM key/rateLimited before guardedFetch at line 66 returns nothing.
- **Observed vs expected:** Observed: unbounded anonymous outbound fetches + DB writes. Expected: per-IP rate limiting / auth in front of the outbound fetch.
- **Verifier note:** Confirmed static. Read the whole route; grep of audit/route.ts for verifyToken|CRM_ACCESS_KEY|x-crm-key|rateLimited|limiter returns nothing. Each anonymous POST triggers guardedFetch (up to 2.5MB), a robots.txt fetch, and a fire-and-forget audits insert, with maxDuration=20s and no throttle. Verified that only /api/sign has any limiter in the entire API (grep of src/app/api). Exact live DoS/cost magnitude would need a running deploy to quantify, but the missing-auth and missing-limiter code facts are certain, and this is the flagship lead-magnet endpoint.

#### `SEC-04` SSRF filter misses hex-compressed IPv4-mapped IPv6, redirect/contact-link hop can reach loopback/metadata

**MEDIUM** · CONFIRMED-STATIC · ssrf · `src/lib/safe-fetch.ts:16`

- **Reproduction:** Node harness (scratchpad/sec04_ssrf.mjs + sec04_undici2.mjs) with verbatim isPrivateIp/isBlockedHost.
- **Observed vs expected:** Observed: guard classifies hex IPv4-mapped IPv6 as public. Expected: any address whose low 32 bits map to loopback/link-local/private is blocked regardless of textual form.
- **Verifier note:** Confirmed filter defect. Harness shows isBlockedHost('[::ffff:7f00:1]'), '[::ffff:a9fe:a9fe]', '[::ffff:a00:1]' all return false, and new URL('http://[::ffff:127.0.0.1]/').hostname canonicalizes to '[::ffff:7f00:1]' (and the metadata literal to '[::ffff:a9fe:a9fe]'), both classified public, so a redirect/contact-link hop to a bracketed mapped-IPv6 literal passes both isBlockedHost and resolvesToPrivate. The candidate's own honest caveats hold: (a) the plan's decimal/int/hex/octal forms (127.1, 2130706433, 0x7f000001, 017700000001) do NOT bypass, because new URL canonicalizes them to 127.0.0.1 and normalizeUrl then returns null for every one (verified); (b) end-to-end metadata reachability is NOT proven on this runtime: undici rejected the mapped-IPv6 literal with EAFNOSUPPORT while 127.0.0.1 gave ECONNREFUSED, so a real internal read depends on the deployed Vercel undici/OS stack. Confirmed as a classification/defense-in-depth defect; landed-connection reachability is NEEDS-DYNAMIC-VERIFICATION on the prod runtime. Medium.

#### `SEC-05` DNS-rebinding TOCTOU in guardedFetch and an unguarded robots.txt fetch

**MEDIUM** · CONFIRMED-STATIC · ssrf · `src/lib/safe-fetch.ts:76`

- **Reproduction:** Code trace: safe-fetch.ts:76 resolvesToPrivate() then :79 fetch() re-resolves with no pin; audit/route.ts:26-42 fetchRobots calls fetch() directly with no host guard.
- **Observed vs expected:** Observed: validate-then-refetch with independent DNS, plus one entirely unguarded fetch. Expected: resolve-then-pin, and route robots.txt through guardedFetch.
- **Verifier note:** Confirmed by code trace. resolvesToPrivate() (safe-fetch.ts:46-54) does dnsp.lookup, then guardedFetch's fetch() at :79 re-resolves with no IP pinning (classic validate-then-refetch TOCTOU). fetchRobots (audit/route.ts:26-42) issues a plain fetch(`${origin}/robots.txt`) with redirect:'manual' but no isBlockedHost/resolvesToPrivate guard, relying only on origin having been vetted by a separate earlier call. Both are genuine structural gaps. A working rebinding exploit needs a controlled low-TTL DNS record and the deployed network stack, so the confirmed part is the code structure; a landed internal connection is NEEDS-DYNAMIC-VERIFICATION. Medium, defense-in-depth.

#### `SEC-06` Legacy Quo webhook signature has no timestamp/replay window, captured events replayable forever

**MEDIUM** · CONFIRMED · webhook-integrity · `src/lib/quo.ts:109`

- **Reproduction:** Node harness (scratchpad/sec06_quo_replay.mjs) with verbatim verifyLegacy/verifyStandard.
- **Observed vs expected:** Observed: legacy path accepts arbitrarily old replayed signatures. Expected: bounded timestamp window as verifyStandard enforces.
- **Verifier note:** Reproduced. Harness with verbatim verifyLegacy (quo.ts:109-115): a legacy openphone-signature header carrying a timestamp 7 days old still returns true, while verifyStandard (quo.ts:118-120) rejects the same old timestamp via its Math.abs()>300 window. Confirms the legacy path lacks any replay window. Practical exploitation requires the attacker to possess one validly-signed legacy event and QUO_WEBHOOK_SECRET_LEGACY to be the active scheme; given those, byte-identical replays are accepted indefinitely and upsert-on-id refreshes/overwrites quo_calls and quo_messages rows. Medium.

#### `SEC-07` QUO_ALLOWED_NUMBERS allowlist is skipped when the event has no own phone number

**MEDIUM** · CONFIRMED-STATIC · authz-data-integrity · `src/app/api/quo/webhook/route.ts:52`

- **Reproduction:** Code trace webhook/route.ts:50-52. An event whose data.context omits phoneNumber yields ownDigits='' so the allowlist branch short-circuits.
- **Observed vs expected:** Observed: missing own-number bypasses the allowlist (fail-open). Expected: with an allowlist configured, drop events with no resolvable own number.
- **Verifier note:** Confirmed static logic at webhook/route.ts:52: `if (allowlist.length && ownDigits && !allowlist.includes(ownDigits)) return`. When context.phoneNumber is absent, ownDigits = phoneDigits('') = '' (falsy), the && short-circuits, and the event is processed despite QUO_ALLOWED_NUMBERS being set (fail-open). Only reachable for events that already pass verifyQuoWebhook, i.e. a legitimately-signed event from another line in a shared multi-line Quo workspace whose payload omits context.phoneNumber; handleCall/handleMessage still require a 10-digit other party (otherParty picks the first from/to when ownDigits is empty). Real fail-open; likelihood bounded to the multi-line-workspace scenario. Medium.

#### `SEC-08` /api/checkout is unauthenticated with unbounded strings and no upper amount clamp

**MEDIUM** · CONFIRMED-STATIC · input-validation-abuse · `src/app/api/checkout/route.ts:39`

- **Reproduction:** Read checkout/route.ts:13-66 (no auth/limiter); b.label/b.plan/b.client unclamped into product_data.name and description; amount only lower-bounded.
- **Observed vs expected:** Observed: unbounded attacker strings and arbitrary amounts reach Stripe from an anonymous, unthrottled endpoint. Expected: length clamps, amount ceiling, rate limiting.
- **Verifier note:** Confirmed static. checkout/route.ts:13-66 has no auth and no limiter (grep clean); b.label/b.plan/b.client flow unclamped into product_data.name (lines 39, 58) and payment_intent_data.description (line 62); amount/monthly are Math.round(Number()) with a lower bound (>=1) but no upper clamp. Anonymous callers can mint Stripe Checkout sessions on the live account with attacker-chosen product names and arbitrary large amounts, usable as brand-abuse phishing pages and quota exhaustion. Two caveats: sessions are created not charged (impact is abuse/quota, not direct theft), and it requires Stripe configured (getStripe() non-null) else it 503s: whether live Stripe is active is owner-verifiable. Medium.

#### `SEC-09` Public email endpoints act as an open relay for domain-branded mail with no rate limit

**MEDIUM** · CONFIRMED-STATIC · abuse-rate-limit · `src/app/api/book/route.ts:85`

- **Reproduction:** book/route.ts:85 and audit-report/route.ts:119 sendEmail to the request's own email with no auth/limiter; sign/route.ts:39 keys its limiter on spoofable x-forwarded-for.
- **Observed vs expected:** Observed: anonymous, unbounded, attacker-addressed sends from the verified domain; the one limiter trusts a spoofable header. Expected: durable per-IP/recipient limits and a trusted client-IP source.
- **Verifier note:** Confirmed static. book/route.ts POST (line 85) and audit-report/route.ts POST (line 119) call sendEmail to the request's own email/to field with no auth and no limiter (grep of both files is clean). sign/route.ts holds the only limiter, keyed on `(x-forwarded-for||'').split(',')[0]` (line 39), which a client can rotate to reset the per-IP counter. Open-relay branded-mail abuse and Resend-quota exhaustion are real IF Resend is configured; sendEmail is a no-op when Resend env is unset, so live send depends on owner confirmation of Resend activation. The missing-limiter code fact and spoofable-IP key are certain. Medium.

#### `SEC-10` CRM master key (also the session-signing secret) is persisted in browser sessionStorage

**MEDIUM** · CONFIRMED-STATIC · secret-handling · `src/components/CrmBoard.tsx:28`

- **Reproduction:** CrmBoard.tsx:28 sessionStorage.setItem('crm_key', k); :46 getItem; :23 sends it as x-crm-key. Value equals process.env.CRM_ACCESS_KEY.
- **Observed vs expected:** Observed: master/signing secret sits in plaintext web storage. Expected: browser holds a scoped, revocable httpOnly session token, not the raw master secret.
- **Verifier note:** Confirmed by reading CrmBoard.tsx: the raw key is stored via sessionStorage.setItem('crm_key', k) (line 28), re-read at line 46, and sent as the x-crm-key header (line 23). That value is process.env.CRM_ACCESS_KEY, the same secret crm-auth.ts:9 uses to HMAC-sign /prospects sessions, so any XSS, malicious extension, or shared-machine read of sessionStorage yields the master secret, which grants /api/leads access and (per SEC-01/SEC-02) the ability to forge crm_session cookies. Single-secret reuse is the multiplier. This is the /crm board, distinct from the cookie-gated /prospects board. Medium.

#### `SEC-11` team-login has no rate limiting/lockout and uses a non-constant-time password compare

**MEDIUM** · CONFIRMED-STATIC · auth-bruteforce · `src/app/api/team-login/route.ts:22`

- **Reproduction:** Read team-login/route.ts:15-27 and crm-auth.ts:21-24: plain ===, no throttle, distinct 503 not_configured vs 401 invalid.
- **Observed vs expected:** Observed: unlimited guesses, timing-variable compare, distinguishable outcomes. Expected: rate limit/lockout with backoff, constant-time compare, uniform failure.
- **Verifier note:** Confirmed static. team-login/route.ts:15-27 has no rate limit, lockout, or delay; checkLogin (crm-auth.ts:23) uses `users[username] === password` (variable-time); responses differ (503 not_configured at :17 vs 401 invalid at :23). The no-throttle online brute-force is the real issue; feasibility depends on CRM_USERS password entropy. The === timing side-channel is genuine but largely theoretical remotely. Demonstrating the live absence of a 429 needs a running server, but the route provably contains no limiter of any kind. Medium.

#### `SEC-12` 254 real prospect records (names, phones, street addresses) committed to the git repo

**MEDIUM** · CONFIRMED · pii-exposure · `src/data/prospects-seed.json:1`

- **Reproduction:** git ls-files | grep prospects-seed => tracked; grep -c '"name"' => 254 records; head shows real names/phones/streets; .gitignore excludes other lead CSVs but not this file.
- **Observed vs expected:** Observed: real third-party PII in source control and history. Expected: seed PII kept out of the repo, consistent with the already-gitignored lead CSVs.
- **Verifier note:** Confirmed. `git ls-files` lists src/data/prospects-seed.json as tracked; grep -c '"name"' = 254 records (wc -l 3608) with real business names, phone numbers, and street addresses (e.g. EZIRONWORK, (786) 908-2369, 1680 SE 16th St, Fort Lauderdale FL 33316). .gitignore explicitly excludes the other lead files (leads-fence-southfl.csv, instantly-fence-leads.csv, guessed-emails-to-verify.csv, etc.) but not this one, so the full prospect list lives in the repo and its history regardless of the app-layer login. History purge requires repo-admin action (owner). Medium.

#### `SEC-13` Sensitive PII stored at rest indefinitely with no retention, deletion or subject-access path

**LOW** · CONFIRMED-STATIC · privacy-lifecycle · `src/app/api/sign/route.ts:54`

- **Reproduction:** Read sign/route.ts:52-65 (ip/userAgent/drawing stored) and webhook/route.ts:84,118 (raw:event). grep src for delete/retention/purge/cron/TTL/erasure over signatures/leads/quo_* finds only the Quo contact.deleted handler.
- **Observed vs expected:** Observed: signatures, transcripts, IPs, raw payloads kept forever with no deletion path. Expected: documented retention, minimized raw payload, subject-access/erasure mechanism.
- **Verifier note:** Confirmed absence. grep across src for delete/retention/purge/cron/TTL/erasure over signatures/leads/quo_* returns only the Quo-driven contact.deleted handler (webhook/route.ts:132); there is no subject-access, erasure, or retention/TTL mechanism anywhere. sign/route.ts:52-65 stores IP, user-agent, and a drawn-signature image (sliced to 60000 bytes); webhook/route.ts:84,118 store the full raw event JSON. Downgraded from medium to low: this is a real governance/compliance gap, not an exploitable code defect with a reproducible harm, and the candidate's 'biometric-adjacent' framing is a stretch (a drawn signature image is PII but not biometric). Final legal sizing (whether a GDPR/CCPA nexus applies to South Florida contractors) is an owner/legal decision.

#### `SEC-14` Presentation-mode masking is a display-only transform; real PII is still fetched and in client state

**LOW** · CONFIRMED-STATIC · pii-presentation · `src/app/prospects/Board.tsx:106`

- **Reproduction:** maskProspect (Board.tsx:106) applied at render (:466/:521/:558) after /api/team returns real records; the network response and React state carry unmasked PII.
- **Observed vs expected:** Observed: masking is a render-time cosmetic. Expected: if it is a security feature, redact server-side; otherwise document as a screenshot aid.
- **Verifier note:** Confirmed and correctly self-limited by the candidate. maskProspect (Board.tsx:106) is a render-time transform over already-fetched records; there is no server-side redaction, so real PII sits in the /api/team network response and React state the whole time presentation mode is on, and readOnly inputs are trivially bypassed. This is an accurate characterization (the candidate itself says it is not a security boundary) rather than an exploitable bug, so it belongs as a low documentation/expectation note. Low.

#### `SEC-15` crm_session token has no embedded expiry and cannot be individually revoked

**LOW** · CONFIRMED-STATIC · session-management · `src/lib/crm-auth.ts:26`

- **Reproduction:** Read makeToken/verifyToken (crm-auth.ts:26-40): the signed payload is just the username, no iat/exp; cookie maxAge is 30 days (team-login/route.ts:11).
- **Observed vs expected:** Observed: non-expiring, non-revocable token. Expected: an exp/iat claim and a per-user token version for revocation.
- **Verifier note:** Confirmed static. makeToken (crm-auth.ts:26-29) signs only the username with no iat/exp; verifyToken (:31-40) checks only the HMAC and that the user still exists. The cookie maxAge is 30 days (team-login/route.ts:11) but the token itself never expires, and the only revocation is rotating CRM_ACCESS_KEY or deleting the user from CRM_USERS, both of which invalidate every session at once. No per-session invalidation exists. Low, defense-in-depth.

#### `SEC-16` audit-report notify email escapes only '<', leaving other HTML metacharacters unescaped

**LOW** · CONFIRMED-STATIC · output-encoding · `src/app/api/audit-report/route.ts:132`

- **Reproduction:** Read audit-report/route.ts:132-133 (summary.replace(/</g,'<') only) vs book/route.ts:11-12 esc() which escapes &,<,>.
- **Observed vs expected:** Observed: only '<' escaped in the notify body. Expected: escape &, <, > (and ideally quotes) via a shared helper as book/route.ts does.
- **Verifier note:** Confirmed static. audit-report/route.ts:132-133 interpolates the attacker-influenced summary with only `.replace(/</g,'<')`; &, > and quotes are left raw, unlike book/route.ts:11-12 esc() which escapes &,<,>. Because '<' IS escaped, no tag or script injection is possible, so the practical impact is entity mangling/inconsistent rendering in the internal notify email, not XSS. The candidate's own framing is accurate. Low.

---

### 2. Data Model & Integrations

_16 findings: 1 critical, 0 high, 9 medium, 6 low._

#### `DATA-04` team_crm whole-document last-write-wins silently wipes the shared pipeline (concurrent edits, transient-load overwrite, swallowed PUT, lost stamps)

**CRITICAL** · CONFIRMED-STATIC · data-integrity · `src/app/api/team/route.ts:32`

- **Reproduction:** Board.tsx: force GET /api/team non-ok; base stays [] (157 only assigns on res.ok), setReady(true) at 195, debounced PUT at 200-206 sends the empty/derived array 800ms later; if the write path is reachable the real doc is overwritten. Concurrent tabs: last full-array PUT wins.
- **Observed vs expected:** Observed: a transient GET failure or a second editor can silently replace the whole shared pipeline and reset export/scan stamps. Expected: no write from an unconfirmed load; concurrent writes reconciled, not clobbered.
- **Fix direction:** Gate persist on a confirmed successful load; add updated_at optimistic concurrency (reject stale) or per-prospect upserts; surface and retry PUT failures instead of swallowing.
- **Verifier note:** Confirmed by static reading (React timing + live Supabase not driven here, but the code is unambiguous). PUT (line 32) is a whole-doc upsert; updated_at is written but never compared (no optimistic concurrency). The persist effect gates only on `ready`, not on load success, and swallows failure with .catch(()=>{}) (204). exportedAt/emailCheckedAt/quoSyncedSig live in the same JSON doc so any clobber resets them, resurrecting already-exported leads. Caveat: if Supabase is fully down the PUT also 503s and is swallowed (no overwrite), so the live-loss path needs a transient/asymmetric GET failure or a second editor, both realistic. Critical: silent whole-pipeline data loss.

#### `DATA-01` Quo webhook overwrites a call's real status and occurred_at on every enrichment event

**MEDIUM** · CONFIRMED · data-integrity · `src/app/api/quo/webhook/route.ts:82`

- **Reproduction:** scratchpad/verify_datamodel.mjs: feed call.completed (status 'completed', createdAt 10:00) then call.transcript.completed (no status, createdAt 10:05) through the exact patch builder (lines 77-97) into a merging id-keyed store.
- **Observed vs expected:** Observed: a call.transcript.completed event rewrites status to 'transcript.completed' and shifts occurred_at forward. Expected: status/occurred_at written once on call.completed/call.missed and never touched by enrichment.
- **Fix direction:** Only write status/occurred_at/duration on call.completed|call.missed; for *.completed enrichment events restrict the patch to id plus the enrichment column.
- **Verifier note:** Reproduced in Node harness: after event B the merged row's status became 'transcript.completed' and occurred_at moved to 10:05, exactly as claimed. Line 82 (status: resource.status || type.replace(/^call\./,'')) and line 83 run on every event; onConflict:'id' upsert (line 101) merges onto the original row. The reader orders by occurred_at and renders status (team/quo-calls/route.ts:45), so it is user-visible. Fires whenever Quo enrichment events omit status but carry participant numbers (the realistic case for transcript/summary/recording). Downgraded high to medium: blast radius is the internal CRM call log only (no PII leak, no money); it corrupts status/ordering, not the call record itself.

#### `DATA-02` Enrichment events (transcript/summary/recording) are dropped when the payload lacks participant numbers

**MEDIUM** · CONFIRMED · data-integrity · `src/app/api/quo/webhook/route.ts:74`

- **Reproduction:** scratchpad/verify_datamodel.mjs: call.transcript.completed with no from/to on resource or context -> otherParty('')='' -> digits.length!==10 -> early return at line 75, upsert at 101 never runs.
- **Observed vs expected:** Observed: an enrichment event with no from/to is discarded before the upsert. Expected: enrichment merges onto the existing row by callId regardless of from/to.
- **Fix direction:** For enrichment types, upsert by id with just the enrichment field when the callId is present, skipping the 10-digit participant guard.
- **Verifier note:** Harness-confirmed the code drops such events, directly contradicting the merging-upsert intent documented at lines 98-100. The code path is proven; the real-world impact (transcript/summary/recording never landing) is conditional on Quo actually omitting participant numbers from enrichment events, which is undocumented, so likelihood needs owner/dynamic verification. In tension with DATA-01: if enrichment carries from/to, DATA-01 fires instead. The handler is defective under either payload shape.

#### `DATA-03` Own-number exclusion and the QUO_ALLOWED_NUMBERS multi-tenant filter are both bypassed when context.phoneNumber is absent

**MEDIUM** · CONFIRMED · data-integrity · `src/app/api/quo/webhook/route.ts:50`

- **Reproduction:** scratchpad/verify_datamodel.mjs: allowlistDropped('+17545512828', allowlist)=true but allowlistDropped('', allowlist)=false; otherParty('','+17545512828','+19545550100')='7545512828' (own number).
- **Observed vs expected:** Observed: no phoneNumber => allowlist ignored (multi-tenant leak) and the row is filed under Stackwrk's own number. Expected: drop non-allowlisted events and file under the other party.
- **Fix direction:** Resolve the receiving number from additional resource fields (phoneNumberId/userId/to); if unresolvable and an allowlist is set, drop the event rather than defaulting ownDigits to ''.
- **Verifier note:** Harness-confirmed both sub-claims. The guard `allowlist.length && ownDigits` (line 52) short-circuits when ownDigits is empty, letting a non-allowlisted event through; otherParty (65-68) cannot exclude the own line so it picks the first candidate (the Stackwrk number). Real logic flaw. Trigger is Quo omitting context.phoneNumber; the multi-tenant leak additionally requires QUO_ALLOWED_NUMBERS to be configured.

#### `DATA-05` Instantly 'Export new' re-emails the same address when two leads share one email

**MEDIUM** · CONFIRMED · data-integrity · `src/app/prospects/Board.tsx:355`

- **Reproduction:** scratchpad/verify_datamodel.mjs: items A and B share shared@office.com; exportInstantly(items,true) returns ['shared@office.com'] on both the first and second run.
- **Observed vs expected:** Observed: the same address is exported in two separate campaign files. Expected: dedup by email across ALL prior exports.
- **Fix direction:** Track exported email addresses globally, or stamp every lead sharing the emitted address, so a previously sent address is filtered on later runs.
- **Verifier note:** Harness-confirmed. First run emits A and stamps only A.exportedAt; the second run's newOnly filter (line 355) passes B (no exportedAt) and the in-batch `seen` set (360-368) is empty for that run, so the identical address is emitted again. Matches lines 354-383. Real double-send. Downgraded high to medium: requires two distinct leads sharing one email exported in separate runs; the CAN-SPAM/deliverability harm is real but bounded.

#### `DATA-06` Best-effort external writes return 200 on a real DB failure, so Quo/Stripe never retry and events are lost with no log

**MEDIUM** · CONFIRMED-STATIC · reliability · `src/app/api/quo/webhook/route.ts:101`

- **Reproduction:** Read: quo upserts use .then(()=>{},()=>{}) (101,119,143) and POST always returns {received:true} (60); Stripe insert swallowed identically (stripe/route.ts:45-52) and returns {received:true} (56).
- **Observed vs expected:** Observed: 200 + silent loss on real infrastructure failure, no retry, no log. Expected: swallow only benign duplicates; log and 5xx on real errors so providers retry.
- **Fix direction:** Inspect the Supabase error: swallow only unique-violation/duplicate; on any other error log and return 5xx so Quo/Stripe retry.
- **Verifier note:** Confirmed static. A genuine Supabase error (missing column, RLS drift, connection error) is discarded, the provider gets 200 and never retries, and nothing is logged. Stripe uses insert with id=event.id (payments PK) so benign duplicate deliveries no-op via PK conflict, but that swallowed conflict is indistinguishable from a real first-time insert failure. Medium: silent retryable failures become permanent losses. The Stripe payments table is documented optional (pure absence is by design), but the swallow also hides real errors.

#### `DATA-07` Legacy Quo webhook signature path has no replay window (only the Standard path checks timestamp freshness)

**MEDIUM** · CONFIRMED · security · `src/lib/quo.ts:109`

- **Reproduction:** scratchpad/verify_datamodel.mjs: signed a legacy header hmac;1;1000000000;<hmac> (year 2001) and verifyLegacy returned true.
- **Observed vs expected:** Observed: legacy-signed events are replayable forever. Expected: the same 300s freshness window applied to the legacy path.
- **Fix direction:** Add `Math.abs(Date.now()/1000 - Number(timestamp)) > 300` to verifyLegacy.
- **Verifier note:** Harness-confirmed a 25-year-old timestamp is accepted. verifyLegacy (quo.ts:109-115) validates only the HMAC over `${timestamp}.${rawBody}` with no freshness check, unlike verifyStandard which rejects |now-ts|>300 (line 120). A captured legacy openphone-signature request is replayable indefinitely and re-upserts rows. Medium: requires QUO_WEBHOOK_SECRET_LEGACY to be the active scheme and a captured valid request.

#### `DATA-09` Inbound audit/Quo lead merge resurrects deleted leads and duplicates on a website-domain edit (no tombstones)

**MEDIUM** · CONFIRMED-STATIC · data-integrity · `src/app/prospects/Board.tsx:159`

- **Reproduction:** Delete an audit-sourced lead and reload: /api/team/audits still returns that domain, `have` no longer contains it (Board.tsx:163), so a fresh uid() card is created and persisted. Edit a saved audit lead's website domain and reload: the original audited domain reappears as a second card.
- **Observed vs expected:** Observed: deleted audit/Quo leads come back and website edits create duplicates. Expected: a tombstone/dismissed set and a stable dedup key that survives edits.
- **Fix direction:** Persist a dismissed-domains/dismissed-phones set (or store the source key on the prospect) and dedup audit leads on the original audited domain.
- **Verifier note:** Confirmed static. team/audits/route.ts reads the append-only `audits` table keyed by derived domain (no delete), and team/quo-calls aggregates append-only quo_calls/quo_messages. The load effect dedups audit leads by dom(website) (163) and quo leads by phoneDigits(phone) (180) against `base`, assigning fresh uids and persisting. Deleting removes the domain/phone from `have` so the still-present feed row re-adds; editing the website changes dom(website) so the original domain re-appears. No tombstone/source-key exists. Medium.

#### `DATA-10` upsertQuoContact create-vs-update dedup contract is self-documented as unverified; a wrong param name means every push creates a duplicate Quo contact

**MEDIUM** · NEEDS-OWNER-VERIFICATION · integration · `src/lib/quo.ts:169`

- **Reproduction:** With live Quo creds: POST the same lead twice to /api/quo/contacts and confirm Quo shows one contact; verify the GET filter param names (externalIds/sources) and response path against Quo's current OpenAPI.
- **Observed vs expected:** Observed: dedup depends on an unverified query contract; a mismatch yields duplicate contacts on every push. Expected: a verified lookup that reliably returns the existing contact so PATCH runs on the second push.
- **Fix direction:** Validate the /contacts lookup and POST/PATCH body against Quo's live API; add a two-push round-trip test asserting one contact.
- **Verifier note:** Cannot round-trip without live Quo credentials (pushing to a real workspace is a side effect), so NEEDS-OWNER-VERIFICATION. Static evidence stands: the create-vs-update decision hinges entirely on existingId from the externalIds/sources lookup (quo.ts:169-171), and the code comment at 148-151 explicitly states the write schema is 'reconstructed from Quo's docs, not a verified example.' If the query-param names or response path are wrong the lookup always returns nothing and every push POSTs a new contact. Amplified by DATA-04 stamp loss (re-push on lost quoSyncedSig).

#### `DATA-11` Live RLS for Stackwrk's tables could not be attested; the entire PII model rests on an unverified deployment state with no automated guard

**MEDIUM** · NEEDS-OWNER-VERIFICATION · security · `supabase/schema.sql:24`

- **Reproduction:** Run against the real Stackwrk project: select relname, relrowsecurity from pg_class where relname in (...); select * from pg_policies where schemaname='public'; plus get_advisors(security).
- **Observed vs expected:** Observed: RLS on the Stackwrk tables is asserted only by checked-in SQL, unverifiable in this environment and unguarded by CI. Expected: an automated attestation proving relrowsecurity=true with zero policies on every table in the deployed project.
- **Fix direction:** Run get_advisors + pg_class/pg_policies against the real Stackwrk project and add a CI/startup assertion that RLS is on with no policies on all eight tables.
- **Verifier note:** Verified the environment limitation myself: mcp Supabase list_projects returns only YatHub (wfyuuthgpdtycgkcczej) and FoxStays Docks (vvmcghumtlnpblrqqjav); list_tables on both shows unrelated yacht/dock schemas, none of Stackwrk's team_crm/quo_calls/quo_messages/quo_contacts/signatures. The Stackwrk project is not reachable here, so live RLS cannot be attested. The repo SQL (schema/team-crm/quo-*/signatures/payments) does declare `enable row level security` with zero `create policy` on all eight tables, matching intent, but there is no migration runner/CI/test guarding the deployed state. Medium: central PII control is unverified and unguarded, not shown broken.

#### `DATA-08` find-email returns the first plausible email, which can be a web designer/agency or platform address rather than the business

**LOW** · CONFIRMED · data-integrity · `src/app/api/leads/find-email/route.ts:21`

- **Reproduction:** scratchpad/verify_datamodel.mjs: bestEmail with a vendor mailto first returned hello@theirwebguy.com over info@realco.com; with a Cloudflare analytics address in text returned ping@cloudflareinsights.com.
- **Observed vs expected:** Observed: the first-seen address wins even when it belongs to a third party; non-listed platform domains slip through. Expected: bias toward the site's own domain and expand the platform denylist.
- **Fix direction:** Rank candidates by same-registrable-domain-as-site first, then generic business locals on the site domain; extend JUNK_DOMAIN.
- **Verifier note:** Harness-confirmed bestEmail returns the first surviving candidate (lines 21-36). JUNK_DOMAIN (line 14) omits cloudflare/squarespace/jsdelivr/hubspot. Real data-quality bug: a third-party/platform address can become the stored outreach email that is later exported to the cold campaign. Low: lead quality, not a security or data-loss issue.

#### `DATA-12` SOFLA_AREA_CODES includes an unassigned code (472) and omits the real 561/Palm Beach overlay (728), misclassifying valid local numbers

**LOW** · CONFIRMED · data-integrity · `src/lib/prospects.ts:77`

- **Reproduction:** scratchpad/verify_datamodel.mjs: phoneCheck('(728) 555-0100').flag='outarea'; phoneCheck('(472) 555-0100').flag='ok'; phoneCheck('(645) 555-0100').flag='ok'.
- **Observed vs expected:** Observed: 728 (Palm Beach) flagged out-of-area; 472 treated as local. Expected: the SoFla set = {305,786,645,954,754,561,728}; drop 472.
- **Fix direction:** Replace '472' with '728' in SOFLA_AREA_CODES (keep 645) after a NANPA cross-check.
- **Verifier note:** Harness-confirmed the code behavior: 472 (in the set at prospects.ts:77) matches while 728 does not, and out-of-area sets tier 'verify' on import (Board.tsx:302), eligible for bulk Skip. The claim that 472 is unassigned and 728 is the assigned 561/Palm Beach overlay (645 a valid 305 overlay) is a NANPA fact I could not re-verify offline; cross-check current NANPA assignments before fixing. Code behavior and internal inconsistency confirmed. Low.

#### `DATA-13` find-email JUNK_LOCAL regex discards legitimate business emails that start with 'test' or are webmaster@

**LOW** · CONFIRMED · data-integrity · `src/app/api/leads/find-email/route.ts:15`

- **Reproduction:** scratchpad/verify_datamodel.mjs: bestEmail(mailto:testimonials@realco.com)=null; testing@realco.com=null; webmaster@realco.com=null.
- **Observed vs expected:** Observed: testimonials@/testing@ and webmaster@ addresses are discarded. Expected: match only exact junk locals and treat webmaster@ as a last-resort fallback.
- **Fix direction:** Anchor 'test' to a standalone/delimited local part; demote webmaster@ to a fallback instead of dropping it.
- **Verifier note:** Harness-confirmed. JUNK_LOCAL (line 15) anchors 'test' with ^ but no trailing delimiter, so any local part starting 'test' is dropped, and webmaster@ is unconditionally dropped. findMissingEmails then stamps emailCheckedAt with no email (Board.tsx:413), marking the lead 'checked, none found' so it is not retried. Real but low: only bites sites whose sole published address starts with test/is webmaster@.

#### `DATA-14` CSV import dedup collapses distinct no-phone businesses and silently drops toll-free rows

**LOW** · CONFIRMED · data-integrity · `src/app/prospects/Board.tsx:287`

- **Reproduction:** scratchpad/verify_datamodel.mjs: import [ABC Fence (no phone), ABC Fence (no phone)] into an empty board => {imported:2, dupes:0}; re-import [ABC Fence (no phone)] against existing [ABC Fence (no phone)] => {imported:0, dupes:1}.
- **Observed vs expected:** Observed: blank-phone dedup is name-only, so distinct businesses merge or near-duplicates duplicate; toll-free drops are invisible. Expected: dedup blank-phone rows on name+city+street and expose dropped toll-free rows.
- **Fix direction:** Strengthen the no-phone dedup key (name+city+street) and surface a list of skipped toll-free rows.
- **Verifier note:** Harness-confirmed doImport logic (Board.tsx:287-308). Blank-phone rows have no in-batch name dedup (both enter), and across imports are skipped only on an exact name+phone match (fragile to near-duplicate names). Toll-free rows are dropped at line 296 with only an aggregate count in the flash, no per-row trace. All three sub-claims reproduce. Low.

#### `DATA-15` Lead source attribution is wrong: /api/leads hardcodes source='audit_form' for the contact form and the popup's site-unreachable fallback

**LOW** · CONFIRMED-STATIC · data-integrity · `src/app/api/leads/route.ts:119`

- **Reproduction:** Read: /api/leads POST always writes source:'audit_form' (line 119) and LeadBody has no source field; contact/page.tsx:83 renders AuditForm (fields company/name/email/website/message, no source); AuditPopup fallback posts to /api/leads with no source while its success path uses /api/audit-report source:'popup_audit'.
- **Observed vs expected:** Observed: contact-form and popup-fallback leads all read source='audit_form'; the popup funnel is inconsistently attributed. Expected: each funnel's leads carry a source identifying the funnel.
- **Fix direction:** Accept an optional whitelisted `source` in the /api/leads POST body and have each client pass its true funnel source; default only when absent.
- **Verifier note:** Confirmed static. /api/leads ignores any caller source and hardcodes 'audit_form', so contact inquiries and the popup's site-unreachable fallback are both stored as 'audit_form', while the popup success path stores 'popup_audit' (audit-report honors source at route.ts:90). Real attribution/routing bug. Low.

#### `DATA-16` team_crm PUT stores an arbitrary array with zero per-field validation or size bound

**LOW** · CONFIRMED-STATIC · data-integrity · `src/app/api/team/route.ts:31`

- **Reproduction:** PUT /api/team (valid crm_session) with data:[{id:'x',stage:'bogus',tier:'nope',...}]. route.ts stores it (only Array.isArray checked). On reload, the 'bogus'-stage card renders in no column and TIER_META['nope'].cls throws.
- **Observed vs expected:** Observed: an unvalidated, unbounded prospect array is accepted and stored. Expected: enum-validate stage/source/tier, require id, clamp fields, bound document size before upsert.
- **Fix direction:** Validate each prospect (enum-check stage/source/tier, require id, clamp strings) and enforce a max document size before upsert.
- **Verifier note:** Confirmed static. PUT accepts any Array.isArray value (line 31) and stores it whole (line 32) with no per-prospect validation, no required id, no clamps, no size bound. Board.tsx filters cards by exact stage.key (line 513) so an invalid stage silently renders nowhere, and TIER_META[p.tier] is accessed for any truthy tier (lines 526, 571) so an out-of-enum tier yields undefined.cls and throws, breaking that card. Requires an authenticated team user to PUT a malformed body (the normal client always sends valid shapes), so it is a defense-in-depth gap. Low.

---

### 3. Reliability, Error Handling & Edge Cases

_20 findings: 0 critical, 2 high, 6 medium, 12 low._

#### `REL-01` Failed/transient initial GET /api/team lets the debounced save overwrite the shared pipeline with an empty list

**HIGH** · CONFIRMED-STATIC · data-integrity · `src/app/prospects/Board.tsx`

- **Reproduction:** Board.tsx:154-158 sets base=[] and only replaces it when res.ok (res is the parsed JSON body, so a 500 query_failed, 401, network error, or json() throw all leave base=[]); audit/quo merges only append; setItems(base)+setReady(true) at 194-195; persist effect 200-206 gated only on ready fires PUT{data:items}; team/route.ts:32 does an unconditional wholesale upsert.
- **Observed vs expected:** Observed: on any non-success of the initial GET, base stays [] (or audit/quo-only) and the ready-gated 800ms PUT wholesale-overwrites team_crm.data. Expected: save gated on a confirmed successful load.
- **Fix direction:** Track load success separately from ready; refuse to PUT (or to write an empty array) unless the initial GET returned ok.
- **Verifier note:** Traced the full path in-repo. res.ok checks the parsed JSON ok field, so every read-failure mode (500/401/network/HTML-500) leaves base empty; audit/quo blocks only append; the ready->true transition triggers the [items,ready] effect which PUTs the empty/partial list; server upsert (team/route.ts:32) replaces the whole document with no guard, so a single transient read failure while Supabase is otherwise up wipes the shared pipeline irreversibly (no versioning). Kept high rather than critical because it needs the GET to fail while the PUT succeeds; impact when it hits is catastrophic. Live repro needs a running server (route-mock the GET), hence CONFIRMED-STATIC.

#### `REL-05` crm-auth signs sessions with a hardcoded public secret when CRM_ACCESS_KEY is unset, making CRM tokens forgeable

**HIGH** · CONFIRMED · auth · `src/lib/crm-auth.ts`

- **Reproduction:** crm-auth.ts:9 SECRET falls back to 'stackwrk-crm-dev-secret'; makeToken (27) and verifyToken (37-39) both use SECRET; a forged token base64url(username)+'.'+base64url(HMAC('stackwrk-crm-dev-secret',username)) passes verifyToken as long as username is in CRM_USERS.
- **Observed vs expected:** Observed: with CRM_USERS set but CRM_ACCESS_KEY unset, every token is HMAC'd with the repo-committed constant 'stackwrk-crm-dev-secret', so anyone who knows a username forges a valid crm_session cookie. Expected: fail closed (503) when CRM_ACCESS_KEY is absent.
- **Fix direction:** Remove the hardcoded fallback; when CRM_ACCESS_KEY is unset, treat the CRM as not_configured and reject all sessions.
- **Verifier note:** Reproduced in Node (scratchpad/rel05_token.js): for username 'tal' the forged token equals makeToken('tal') exactly and verifyToken(forged) returns 'tal' (auth bypass) using only the committed constant and a known username, no password. Grants full read/write to /api/team plus every verifyToken-gated route. Precondition (CRM_ACCESS_KEY unset while CRM_USERS set) is a realistic partial-config state. Strongest finding in the set.

#### `REL-02` resolvePhoneNumberId caches null permanently after one transient failure, disabling live call history for the instance lifetime

**MEDIUM** · CONFIRMED-STATIC · reliability · `src/lib/quo.ts`

- **Reproduction:** quo.ts:37-45: when QUO_PHONE_NUMBER_ID is unset, a failed quoFetch('/phone-numbers') yields resolved=null stored at line 43; line 39 short-circuits all later calls to null; fetchCallHistory returns [] at line 60.
- **Observed vs expected:** Observed: a null resolution is cached forever (cachedPhoneNumberId=null), so every later fetchCallHistory returns [] for the warm instance even after Quo recovers. Expected: do not negatively-cache a failed resolution.
- **Fix direction:** Only cache a non-null id; leave the cache undefined on failure, or add a short TTL.
- **Verifier note:** Confirmed by reading the cache logic: cachedPhoneNumberId is module-level and the guard returns it whenever it is not undefined, so a transient null is frozen. Downgraded high to medium: only affects deploys that leave QUO_PHONE_NUMBER_ID unset (docs recommend setting it), and it only disables the LIVE Quo lookup in the drawer; webhook-synced DB rows still render. Degradation, not data loss.

#### `REL-03` No rate limiting on the public POST endpoints (audit, audit-report, book, leads, checkout); only /api/sign throttles

**MEDIUM** · CONFIRMED-STATIC · abuse · `src/app/api/audit/route.ts`

- **Reproduction:** grep across src/app/api shows rateLimited only in sign/route.ts (lines 17,41); glob for src/**/middleware.ts returns nothing; audit/book/leads/checkout/audit-report routes contain no limiter.
- **Observed vs expected:** Observed: audit (SSRF-guarded outbound crawler), audit-report, book, leads POST, and checkout (mints real Stripe sessions) accept unbounded public POSTs. Expected: per-IP throttling like /api/sign.
- **Fix direction:** Extract sign's rateLimited into a shared helper (or edge middleware) and apply to audit, audit-report, book, leads POST, checkout.
- **Verifier note:** Confirmed via grep: the only rateLimited helper and call live in sign/route.ts and there is no middleware.ts. The public routes are genuinely unthrottled. Downgraded high to medium: audit/find-email are SSRF-guarded and byte/time-capped, and Vercel provides some platform DoS protection; sharpest concrete impact is unbounded Stripe Checkout session creation and outbound-crawl amplification (server IP blocklisting).

#### `REL-04` Failed saves are silent and lost: Board persist uses .catch(()=>{}) with no toast; CrmBoard.patch never checks res.ok

**MEDIUM** · CONFIRMED-STATIC · data-integrity · `src/components/CrmBoard.tsx`

- **Reproduction:** Board.tsx:204 persists with .catch(()=>{}) (no toast). CrmBoard.tsx:54-65 awaits fetch in try/finally that only clears savingId and never inspects res.ok; the status select (defaultValue line 182) and notes textarea (defaultValue line 172) are uncontrolled, so a failed PATCH leaves the stale value visible until the next load.
- **Observed vs expected:** Observed: PUT/PATCH failures produce no UI feedback and silent divergence; uncontrolled select/textarea keep the edited value while the DB was never updated. Expected: check res.ok, surface an error, preserve/retry the edit.
- **Fix direction:** Inspect res.ok in both paths; on failure show a toast and keep the pending edit or retry with backoff.
- **Verifier note:** Verified both save paths in-repo. Board swallows all PUT errors; CrmBoard.patch ignores res.ok and the inputs are uncontrolled, so a 500/network failure loses the edit with no indication on next Refresh. Confirmed silent-loss-on-failure; medium because it requires the save request to actually fail.

#### `REL-06` Resend sendEmail has no timeout and book/sign set no maxDuration, so a slow Resend stalls the request to a 504 after the record is already persisted

**MEDIUM** · CONFIRMED-STATIC · reliability · `src/lib/email.ts`

- **Reproduction:** email.ts:59 fetch has no signal/timeout. book/route.ts inserts the lead (72-80) then awaits sendEmail twice (85-102); sign/route.ts inserts the signature (58-70) then awaits sendEmail twice (79-84). grep confirms maxDuration is present on audit/find-email/audit-report but absent on book and sign.
- **Observed vs expected:** Observed: sendEmail fetches Resend with no AbortController; book and sign await it serially after the durable insert and declare no maxDuration, so a slow Resend can run to the platform cap and 504 while the record already exists, prompting a client resubmit. Expected: bounded per-send timeout and/or fire-and-forget notify.
- **Fix direction:** Add an AbortController timeout inside sendEmail; set explicit maxDuration on book/sign; send the notify copy without awaiting it.
- **Verifier note:** Code facts confirmed by reading both routes and email.ts and by the maxDuration grep (book and sign do not appear). book uses insert (not upsert) and sign mints a fresh random id per call, so a 504-driven resubmit creates duplicate leads/signatures. The exact 504 depends on the deployed function timeout, hence CONFIRMED-STATIC; the missing timeout and duplicate-on-retry risk are real. Medium.

#### `REL-07` quoFetch has no timeout and /api/team/quo-calls sets no maxDuration, so a slow Quo hangs the drawer Activity fetch instead of degrading to the DB-only merge

**MEDIUM** · CONFIRMED-STATIC · reliability · `src/lib/quo.ts`

- **Reproduction:** quo.ts:20-33 fetch with cache:'no-store' but no signal. quo-calls/route.ts:57 const live = await fetchCallHistory(phone).catch(()=>[]); DB rows are computed into byId before this await (42-56); grep shows no maxDuration on quo-calls.
- **Observed vs expected:** Observed: quoFetch has no signal/timeout; the phone branch awaits fetchCallHistory guarded only by .catch (handles rejection, not a hang), and the route declares no maxDuration, so a stalled Quo runs to the platform cap and 504s instead of returning the already-computed DB merge. Expected: bound quoFetch with a timeout.
- **Fix direction:** Thread an AbortController timeout through quoFetch/fetchCallHistory and add maxDuration to the quo-calls route.
- **Verifier note:** Verified by reading quo.ts and the quo-calls route plus the maxDuration grep (quo-calls absent). .catch cannot rescue a pending hang, and the route already has the DB-only merge in hand, so the hang purely converts a good degraded response into a 504. CONFIRMED-STATIC because the 504 is platform-timeout dependent; the missing timeout is a real fact. Medium.

#### `REL-11` The shared team_crm document is upserted wholesale with last-write-wins and no conflict detection

**MEDIUM** · CONFIRMED-STATIC · data-integrity · `src/app/api/team/route.ts`

- **Reproduction:** team/route.ts:32 upsert({id:DOC_ID,data:body.data,updated_at:now}) with no stored-timestamp comparison; GET returns updatedAt (20) but Board.tsx:156-157 only reads res.data and ignores updatedAt.
- **Observed vs expected:** Observed: PUT unconditionally upserts the whole document; GET returns updated_at but Board never reads it back and the PUT carries no If-Match, so the last debounce wins and clobbers the other editor's whole list. Expected: optimistic-concurrency check or server-side field merge.
- **Fix direction:** Send the loaded updated_at with the PUT and reject the upsert when the stored value is newer; reload/merge on conflict.
- **Verifier note:** Confirmed by reading both sides: the write is a full-document replace with no concurrency guard and the client discards the returned updated_at. Genuine last-write-wins clobber that compounds REL-01. Kept medium; the CRM is explicitly a shared team pipeline with multi-user CRM_USERS support, though solo-builder usage lowers real-world likelihood.

#### `REL-08` DNS resolution in the SSRF guard is not bounded by the AbortController or any timeout

**LOW** · CONFIRMED-STATIC · reliability · `src/lib/safe-fetch.ts`

- **Reproduction:** safe-fetch.ts:49 dnsp.lookup(hostname,{all:true}) with no timeout; guardedFetch:76 awaits resolvesToPrivate outside the fetch abort; the controller signal is passed only to fetch (audit route:60-61, find-email:53-54).
- **Observed vs expected:** Observed: resolvesToPrivate's dnsp.lookup takes no signal and guardedFetch awaits it per hop before the abortable fetch, so the route AbortController never bounds DNS. Expected: bound the lookup by the same deadline (Promise.race) and fail closed to unreachable.
- **Fix direction:** Wrap the lookup in a Promise.race with a timeout tied to the fetch deadline; fail closed to unreachable on DNS timeout.
- **Verifier note:** Code fact fully confirmed: dns.lookup does not accept the AbortSignal and runs before the guarded fetch, so the route timer cannot interrupt it. Downgraded medium to low: getaddrinfo has its own OS resolver timeout (a few seconds per attempt), so 'unbounded' overstates it; a blackholed authoritative DNS is an edge that could exceed FETCH_TIMEOUT_MS and approach maxDuration=20, but needs deliberately slow DNS. Real but low-probability; degradation only (504 vs clean unreachable).

#### `REL-09` A literal JSON null body throws an uncaught TypeError and returns 500 instead of a clean 400 (scalar/array sub-claim refuted)

**LOW** · CONFIRMED · error-handling · `src/app/api/audit/route.ts`

- **Reproduction:** audit:52 body.url, leads:91 body.company, book:49 body.company, audit-report:68 body.company, sign:32 body.company, checkout:25 b.email (Stripe-configured), team-login:21 destructure (CRM_USERS set), team PUT:31 body.data (authenticated). req.json() returns null for a null body, and property access on null throws.
- **Observed vs expected:** Observed: a body of literal JSON null makes body.X throw outside the try that only wraps req.json(), yielding a 500. Expected: a clean 400/422 for non-object bodies. Note: scalars/arrays do NOT reproduce this.
- **Fix direction:** After parsing, reject non-object bodies (if !body || typeof body!=='object' || Array.isArray(body)) before reading fields.
- **Verifier note:** Reproduced in Node (scratchpad/rel09_null.js): only null throws (TypeError: Cannot read properties of null); JSON 42, [], and {} all return undefined on property access and do NOT throw. So the candidate's claim that -d '42' or -d '[]' also 500s is FALSE; I narrowed the finding to the null body only. Confirmed for null across the listed public routes; conditional routes (checkout/team-login/team) also 500 on null once preconditions are met. Severity low: wrong status code, no security or data impact.

#### `REL-10` A corrupted agreement ?d param renders $NaN and passes NaN into checkout, breaking the document for a client

**LOW** · CONFIRMED · data-integrity · `src/lib/agreement.ts`

- **Reproduction:** agreement.ts:56-58 resolveAgreement spreads decoded data over defaults with no numeric check; buildAgreement:64 deposit=Math.round((projectFee*depositPct)/100). page.tsx:17 destructures deposit+money from buildAgreement and passes depositAmount to SignBlock; SignBlock.tsx:58 posts amount:depositAmount to /api/checkout.
- **Observed vs expected:** Observed: a non-numeric projectFee decoded from ?d makes deposit/balance NaN and money(NaN) render '$NaN' throughout, and SignBlock posts amount:NaN. Expected: coerce/validate numeric fields to finite numbers with preset fallbacks.
- **Fix direction:** In resolveAgreement, coerce projectFee/depositPct/careMonthly/listFee via Number.isFinite checks with preset fallbacks before buildAgreement.
- **Verifier note:** Reproduced in Node (scratchpad/rel10_nan.js): {projectFee:'abc'} yields deposit=NaN, money(deposit)='$NaN', money(balance)='$NaN', and the encoded d matches the candidate's cited value. Confirmed checkout rejects amount:NaN as bad_amount, so no wrong charge, but a paying client opening the link sees $NaN fee/deposit/balance. Downgraded medium to low: no financial loss, and ?d is generated programmatically by the CRM from numeric presets, so it takes a typo/corruption to trigger.

#### `REL-12` Client-side email hunt fans out at CONCURRENCY=5 over all leads to /api/leads/find-email with no server-side rate cap

**LOW** · CONFIRMED-STATIC · abuse · `src/app/prospects/Board.tsx`

- **Reproduction:** Board.tsx:392-422 (CONCURRENCY=5 at 401) POSTs /api/leads/find-email per unchecked lead; find-email/route.ts has no limiter and makes homepage + one contact-page fetch (81-90).
- **Observed vs expected:** Observed: 5 client workers POST find-email per lead, each triggering up to 2 external guardedFetch requests, with no server-side concurrency/rate cap. Expected: server-side bound regardless of the client loop.
- **Fix direction:** Add per-session rate limiting to find-email or a server-side bounded queue instead of trusting the client CONCURRENCY.
- **Verifier note:** Confirmed by reading both files: no server-side backpressure on find-email. Downgraded medium to low because find-email requires team login (verifyToken at route:73-76), so this is a self-inflicted burst by an authenticated teammate, not an unauthenticated abuse vector; the real risk is the server IP getting throttled/blocklisted by target sites during a large hunt.

#### `REL-13` AuditTool.run parses res.json() with no catch, so a 504/HTML response is thrown and mislabeled as a generic 'Network error'

**LOW** · CONFIRMED-STATIC · error-handling · `src/components/AuditTool.tsx`

- **Reproduction:** AuditTool.tsx:350 const json = await res.json() (no .catch), outer catch at 358-361. Siblings do it right: LeadAudit.tsx:32 .catch(()=>({})) and AuditTool ReportCapture at line 224 .catch(()=>({})).
- **Observed vs expected:** Observed: AuditTool.run does await res.json() with no catch, so a non-JSON error body (504 HTML) throws into the outer catch and shows 'Network error. Please try again.' Expected: catch the parse like the siblings and branch on status for a timeout/unreachable message.
- **Fix direction:** Use await res.json().catch(()=>({})) in AuditTool.run and branch on res.status for a timeout-specific message.
- **Verifier note:** Confirmed by reading all three call sites: the homepage AuditTool.run is the lone flow without the .catch guard, so a real timeout of a large/slow site is mislabeled as a network error. Purely a UX message-accuracy issue. Low.

#### `REL-14` readBodyCapped swallows any body-read error to an empty string, so a mid-body drop is scored as an empty document and gets a 'needs a rebuild' scorecard

**LOW** · CONFIRMED-STATIC · reliability · `src/lib/safe-fetch.ts`

- **Reproduction:** safe-fetch.ts:120-122 catch returns ''; audit/route.ts:83-88 also coerces to html=''; with html='' the parsed signals (title, viewport, h1, etc.) all fail and the score/headline degrade to the harshest tier.
- **Observed vs expected:** Observed: a stream error during body read returns '' (indistinguishable from a legitimately empty page), so every content check fails and the audit emits a very low score and the 'This needs a rebuild' headline for a site that actually dropped mid-transfer. Expected: signal read failure distinctly and return unreachable.
- **Fix direction:** Have readBodyCapped throw or return null on read failure (distinct from an empty body) and make the audit route return unreachable when the body could not be read.
- **Verifier note:** Confirmed by reading readBodyCapped and the audit route body handling: a failed read (connection dropped after headers) is treated identically to a valid empty document. The conflation is real; exact resulting score depends on HTTPS caps and which checks pass, but the direction (damning score for a transport failure) holds. Low, lead-magnet credibility only.

#### `REL-15` Quo webhook allowlist (QUO_ALLOWED_NUMBERS) is bypassed whenever context.phoneNumber is absent, letting a foreign line's calls leak in

**LOW** · CONFIRMED · data-integrity · `src/app/api/quo/webhook/route.ts`

- **Reproduction:** quo/webhook/route.ts:50 ownDigits=phoneDigits(context.phoneNumber||''); line 52 short-circuits on && ownDigits; handleCall/handleMessage then run and upsert the row.
- **Observed vs expected:** Observed: the guard if (allowlist.length && ownDigits && !allowlist.includes(ownDigits)) skips filtering when ownDigits is empty, so events lacking context.phoneNumber are processed regardless of the allowlist. Expected: fail closed when an allowlist is configured and the event can't be attributed.
- **Fix direction:** When allowlist.length is set, drop events where ownDigits is empty or not in the list (remove the && ownDigits).
- **Verifier note:** Reproduced the boolean in Node (scratchpad/rel15_allow.js): a foreign number WITH phoneNumber is dropped (processed=false), but an event MISSING phoneNumber with a foreign from/to is processed=true, leaking into quo_calls despite the allowlist. Confirmed fail-open. Low: requires a shared Quo workspace, a configured allowlist, and events that omit context.phoneNumber.

#### `REL-16` Legacy Quo webhook verification ignores timestamp freshness, so a captured legacy payload can be replayed

**LOW** · CONFIRMED-STATIC · auth · `src/lib/quo.ts`

- **Reproduction:** quo.ts:109-115 verifyLegacy has no timestamp check; verifyStandard:120 enforces Math.abs(Date.now()/1000-ts)>300.
- **Observed vs expected:** Observed: verifyLegacy validates the HMAC over ${timestamp}.${rawBody} but never checks timestamp recency, unlike verifyStandard which enforces a 300s window. Expected: the same freshness window on legacy signatures.
- **Fix direction:** Parse and validate the legacy timestamp against a bounded window (e.g. 300s) before accepting the signature.
- **Verifier note:** Confirmed the asymmetry by reading both verifiers: legacy has no replay window. Kept low because handleCall/handleMessage/handleContact all upsert with onConflict on the event id (route lines 101,119,143), so replaying an identical captured payload is idempotent (re-writes the same row) and the attacker cannot alter the body without breaking the HMAC. Real hardening gap, limited practical impact.

#### `REL-17` Stripe and Quo webhook DB writes use .then(()=>{},()=>{}) that swallows all Supabase errors while returning 200

**LOW** · CONFIRMED-STATIC · reliability · `src/app/api/webhooks/stripe/route.ts`

- **Reproduction:** stripe/route.ts:45-52 insert(...).then(()=>{},()=>{}) then returns received:true (56); quo/webhook/route.ts upserts at 101,119,143 with the same swallow.
- **Observed vs expected:** Observed: payment and quo_* inserts discard every error (missing table, PK conflict, RLS, transient) with no log, and the route still returns 200, so the provider never retries and the durable log can silently develop gaps. Expected: at least log the error; ideally 5xx for retryable failures.
- **Fix direction:** Replace the empty rejection handler with an error log, and consider 5xx for genuinely retryable DB failures so the provider redelivers.
- **Verifier note:** Confirmed by reading both webhooks: all DB errors are dropped behind a 200. Low: these tables are convenience mirrors and the Stripe/Quo dashboards remain the authoritative record; the design is deliberately best-effort (comments say 'table optional'), but swallowing transient errors silently with no log line is a genuine observability gap.

#### `REL-18` Checkout honors a client-supplied amount validated only against NaN/<1, not against expected plan pricing

**LOW** · CONFIRMED-STATIC · data-integrity · `src/app/api/checkout/route.ts`

- **Reproduction:** checkout/route.ts:49-50 amount=Math.round(Number(b.amount)); if(!amount||amount<1) bad_amount; care path 30-31 identical; no PLAN_PRESETS reconciliation.
- **Observed vs expected:** Observed: the deposit/monthly amount comes from the client and is only checked for NaN/<1, so any positive integer is minted into a real Stripe session with an arbitrary plan name. Expected: reconcile the amount server-side against PLAN_PRESETS for the named package.
- **Fix direction:** Derive or validate the deposit/care amount server-side from PLAN_PRESETS keyed by the package rather than trusting the posted amount.
- **Verifier note:** Confirmed the validation is NaN/<1 only. Kept low: the funds always flow into Stackwrk's own Stripe account (no victim to divert money to), so the practical effect is a client under/over-paying their own deposit or creating spam sessions, plus a trust-boundary smell. Real validation gap, limited business impact.

#### `REL-19` Board renders zeroed stats and empty columns during load (no ready-guard skeleton)

**LOW** · CONFIRMED-STATIC · ux-state · `src/app/prospects/Board.tsx`

- **Reproduction:** Board.tsx:468 renders the board view when view==='board' with no ready gate; stats at 471 use items.length/hot/dueToday/won; columns render from filtered (empty during load); line 506 empty hint is the only ready guard.
- **Observed vs expected:** Observed: the board-view stats and stage columns render from items while ready is false and items is [], flashing 0 Total and empty columns; only the empty-hint at line 506 is ready-gated. Expected: a ready skeleton until the initial load resolves.
- **Fix direction:** Render a loading skeleton while !ready instead of the live-but-empty board and stats.
- **Verifier note:** Confirmed the render is not ready-gated. The default view is 'today' (useState('today') at line 137) and view is not persisted, so the flash is only visible if the user clicks 'Full board' within the brief 3-sequential-fetch load window. Real but minor UX inconsistency versus CrmBoard/LeadAudit. Low.

#### `REL-20` /api/team/quo-calls aggregate path issues unbounded selects (no .limit) over quo_calls/quo_messages/quo_contacts on every board load

**LOW** · CONFIRMED-STATIC · efficiency · `src/app/api/team/quo-calls/route.ts`

- **Reproduction:** quo-calls/route.ts:68-72 select quo_calls/quo_messages/quo_contacts with no .limit(); the phone branch bounds with .limit(50) (45-46); Board.tsx:178 fetches this on every mount; siblings bound reads (leads .limit(300), sign .limit(100), audits limited).
- **Observed vs expected:** Observed: the no-phone branch selects three tables with no .limit() and aggregates in the route, so every /prospects mount full-scans them and the per-number aggregation silently truncates once history exceeds the PostgREST default cap. Expected: bounded/paginated reads or a server-side aggregate.
- **Fix direction:** Add an explicit ordered .limit (or push the aggregation into a SQL view/RPC) so the read is bounded and the counts are complete.
- **Verifier note:** Confirmed by reading the route: the aggregate branch has no explicit limit, so it relies on PostgREST's default 1000-row cap, which both full-scans on each load and makes the aggregated counts/last_call incomplete beyond ~1000 rows. Low: efficiency plus at-scale correctness, no immediate failure.

---

### 4. Conversion & UX Funnels

_15 findings: 0 critical, 1 high, 7 medium, 7 low._

#### `CONV-01` Every care-plan card CTA on /pricing scrolls nowhere (dead #audit anchor)

**HIGH** · CONFIRMED-STATIC · funnel · `src/components/Plans.tsx:79`

- **Reproduction:** Grep id="audit" across src returns only src/components/AuditSection.tsx:7. AuditSection is imported only by src/app/page.tsx (home). Plans is rendered only by src/app/pricing/page.tsx:149. Plans.tsx care cards use bare href="#audit" at lines 71 and 79; all carePlans[].stripeUrl are "" (pricing.ts:166,181,196) so the Subscribe branch never renders and #audit is the sole CTA.
- **Observed vs expected:** Observed: on /pricing, each care card's only CTA points to a bare #audit that does not exist on that route, so it does not reach the audit form. Expected: /#audit like the sibling CTAs.
- **Fix direction:** Change the two bare href="#audit" in Plans.tsx to /#audit (or /contact).
- **Verifier note:** Reproduced statically. Read Plans.tsx: care cards fall to the stripeUrl-false branch (lines 77 to 85) whose only action is href="#audit" (line 79); the secondary link at line 71 is also bare #audit. Confirmed id="audit" exists only in AuditSection.tsx:7, which src/app/pricing/page.tsx does not import. The same file's footer button (Plans.tsx:92) and the build tiers (pricing/page.tsx:131) correctly use /#audit, proving the care-card anchors are an oversight. A bare #audit on /pricing resolves to no element, so the primary action on the recurring-revenue cards is dead. High is warranted.

#### `CONV-02` Audit funnel shows success/on-its-way copy even when nothing was emailed

**MEDIUM** · CONFIRMED-STATIC · broken-promise · `src/components/AuditPopup.tsx:83`

- **Reproduction:** AuditPopup.submit (AuditPopup.tsx:51 to 89): the reachable branch awaits /api/audit-report but never reads its response; the unreachable branch (lines 73 to 82) posts only /api/leads and generates/sends nothing. Both fall through to setStatus("done") at line 83, whose UI (lines 120 to 124) reads "Your audit is on its way to <email>" plus "10% founding discount is locked in." api/audit-report/route.ts:138 returns {ok:true, emailed:send.sent}; email.ts:56 returns {sent:false} when RESEND_API_KEY is missing.
- **Observed vs expected:** Observed: AuditPopup shows "Your audit is on its way" unconditionally, including in the site-unreachable branch where no report is generated or emailed. Expected: distinct copy when no report was sent.
- **Fix direction:** Gate the popup done copy on the audit-report response; in the unreachable branch, do not claim delivery.
- **Verifier note:** CONFIRMED for AuditPopup: it never inspects the audit-report response and the unreachable branch emails nothing yet still shows "on its way" (deterministic whenever a prospect's URL is down or typo'd). PARTIAL CORRECTION to the finding's ReportCapture claim: ReportCapture in AuditTool.tsx does NOT only check json.ok - it reads json.emailed (line 226) and branches to distinct copy ("Report sent" vs "You're in, {name}" / "we'll send ... shortly"). Its emailed=false copy is still a soft broken promise (no retry queue backs "shortly"), but it is not the always-on false claim the finding describes. Downgraded to medium: this is a trust/copy defect, not security or data loss; the AuditPopup case is the solid, deterministic part.

#### `CONV-03` Client can tamper the deposit amount before Stripe checkout (server never re-derives price)

**MEDIUM** · CONFIRMED · data-integrity · `src/app/api/checkout/route.ts:49`

- **Reproduction:** SignBlock.payDeposit posts amount: depositAmount from the client (SignBlock.tsx:56 to 59). checkout/route.ts:49 to 61 does amount = Math.round(Number(b.amount)); rejects only !amount || amount < 1; multiplies into unit_amount = amount*100; never re-derives from the agreement config. Ran conv03_checkout_amount.js replicating the logic.
- **Observed vs expected:** Observed: /api/checkout bills whatever amount the client posts (only >=1 enforced). Expected: deposit re-derived server-side from a trusted/signed source.
- **Fix direction:** Re-derive deposit (and care monthly, line 30) server-side via buildAgreement from a signed/encoded config, not from b.amount.
- **Verifier note:** CONFIRMED by execution. Script output: client posts amount=1 -> unit_amount 100 cents ($1) accepted; amount=0.5 rounds to 1 and bills $1; amount=0/-10 rejected 422. The true Growth deposit ($2250) is never cross-checked. Additionally confirmed the ?d= config is unsigned: encodeAgreement/decodeAgreement (agreement.ts:151 to 167) are plain base64 of JSON with no HMAC, so the whole config is client-controlled. The Stripe webhook (webhooks/stripe/route.ts:42 to 54) only logs payments; no reconciliation. Kept medium: real payment-integrity flaw but the exploit is a client underpaying their own deposit (balance still owed), limited blast radius.

#### `CONV-05` Demo CTAs are labeled by product but all dump into the generic mockup form, losing the intent

**MEDIUM** · CONFIRMED-STATIC · funnel · `src/components/DemoShowcase.tsx:10`

- **Reproduction:** DemoShowcase.tsx: DemoCTA links to #about (line 10) with product labels at lines 258, 382, 614, 737. On home, id="about" is FinalCTA (FinalCTA.tsx:33), which renders the mockup form (content.ts:195). AuditForm (used by FinalCTA) captures name/email/website/message only, no demo-intent field.
- **Observed vs expected:** Observed: product-specific demo CTAs (AI assistant, CRM, uplift, redesign) all scroll to the generic "Get a Free Site Mockup" form with no captured demo context. Expected: matching offer or a prefilled/recorded intent.
- **Fix direction:** Prefill the form message with the demo the visitor came from, or route to a product-specific path.
- **Verifier note:** CONFIRMED statically. Verified DemoCTA href="#about" (DemoShowcase.tsx:10) and the four product labels via grep (258/382/614/737). Confirmed id="about" maps to FinalCTA (grep: FinalCTA.tsx:33) which uses finalCta.formTitle "Get a Free Site Mockup" and embeds AuditForm, whose fields (AuditForm.tsx:82 to 106) record no demo interest. Label-to-destination mismatch and lost intent are real. Medium retained.

#### `CONV-06` Cancelling Stripe checkout drops the client on a blank default agreement

**MEDIUM** · CONFIRMED-STATIC · funnel · `src/app/api/checkout/route.ts:64`

- **Reproduction:** checkout/route.ts:64 sets cancel_url: ${origin}/agreement (no query). agreement/page.tsx:16 does resolveAgreement(raw ? decodeAgreement(raw) || {} : {}); with no ?d= it resolves DEFAULT_AGREEMENT (clientName [Client Business Name], Growth, $4500).
- **Observed vs expected:** Observed: deposit cancel_url is /agreement with no ?d=, so cancelling returns to a generic default agreement. Expected: /agreement?d=<same config> to preserve the deal.
- **Fix direction:** Include the encoded config in cancel_url, e.g. ${origin}/agreement?d=${d} (route would need the encoded d passed in the body).
- **Verifier note:** CONFIRMED statically. Read both files: cancel_url has no query (line 64); agreement page falls back to DEFAULT_AGREEMENT (agreement.ts:41 to 54) when d is absent (page.tsx:16). A client who backs out on Stripe loses their personalized deal context. Note the care branch cancel_url is ${origin}/ (line 45), a different but also non-restoring target. Medium retained: real UX regression on the paying-client flow, no data loss.

#### `CONV-07` Placeholder testimonial renders live on the home page with a fake 5-star rating

**MEDIUM** · CONFIRMED-STATIC · trust · `src/lib/content.ts:240`

- **Reproduction:** content.ts:240 to 245 is a TODO stub (add a third real client quote here). Testimonials.tsx:16 maps ALL entries and stamps a hardcoded 5-star row (lines 23 to 27). Testimonials is rendered on home (page.tsx:68).
- **Observed vs expected:** Observed: a stub testimonial (name Client, role Local service business, TODO) renders live with a hardcoded 5-star row. Expected: only real, confirmed testimonials render.
- **Fix direction:** Remove testimonials[2] (or render only confirmed-real entries) until a genuine third quote exists.
- **Verifier note:** CONFIRMED statically. Read content.ts: testimonials[2] carries a TODO(Tal) comment and generic Client / Local service business attribution; the array header (lines 224 to 225) flags the wording as DRAFT. Testimonials.tsx renders every entry with a fixed 5-star row under the What clients say trust section. The placeholder is live. Medium retained (trust defect).

#### `CONV-08` BookingDemo sends a real your-call-is-booked confirmation for a meeting no calendar holds

**MEDIUM** · CONFIRMED-STATIC · funnel · `src/components/DemoShowcase.tsx:83`

- **Reproduction:** DemoShowcase.tsx BookingDemo.submit (lines 71 to 101) POSTs /api/book (line 83) and shows "You're booked!" (line 112). book/route.ts emails confirmationHtml with header "Your intro call is booked" (line 19) and "you're on the calendar" (line 24); the only calendar artifact is a client-side Google Calendar add link (gcalUrl, DemoShowcase.tsx:42 to 51). Real Calendly is used elsewhere via site.calendlyUrl.
- **Observed vs expected:** Observed: the demo booking POSTs /api/book, which inserts a CRM lead and emails "Your intro call is booked / you're on the calendar", and the UI shows "You're booked!" - but no calendar event is created for Tal. Expected: non-binding demo, or a single authoritative (Calendly) booking.
- **Fix direction:** Make the demo clearly non-binding (no confirmation email) or funnel it into the same Calendly booking.
- **Verifier note:** CONFIRMED statically. Read book/route.ts end to end: it inserts a leads row (source booking) and sends a branded booked / on the calendar email; there is no Google Calendar API call server-side, only the visitor-facing gcal add link. Two booking surfaces coexist (this demo vs Calendly). Real no-show/double-book risk. Mitigation noted: Tal does get a notify email and a CRM lead, so it is not silent. Medium retained.

#### `CONV-09` Entry AuditPopup has no Escape, no scroll lock, and a backdrop click silently discards everything typed

**MEDIUM** · CONFIRMED-STATIC · a11y · `src/components/AuditPopup.tsx:96`

- **Reproduction:** AuditPopup.tsx:94 to 100 backdrop has onClick={close}; there is no window keydown listener and no document.body.style.overflow change anywhere in the component (verified reading lines 30 to 46 and 91 to 168). close() (lines 42 to 46) just hides + sets seen. Compare MockupModal.tsx:23 to 30 (Escape + overflow lock).
- **Observed vs expected:** Observed: role=dialog with backdrop onClick={close}, no Escape handler, no body scroll lock, no focus trap/return; a misclick discards url+name+email+consent. Expected: Escape, scroll lock, focus trap, guarded backdrop close (as MockupModal does).
- **Fix direction:** Add Escape, body scroll lock, focus trap/return, and guard backdrop close when fields contain input.
- **Verifier note:** CONFIRMED statically. Read the full component: no Escape handler, no scroll lock, no focus management; backdrop onClick={close} at line 96 discards all typed input with no confirmation. Directly contrasts MockupModal, which implements both Escape and body overflow lock. This is the highest-friction form on the site. Medium retained (a11y plus accidental data loss).

#### `CONV-04` Two competing free offers (Free Mockup vs Free Audit + 10% off) split the primary action

**LOW** · CONFIRMED-STATIC · funnel · `src/lib/content.ts:46`

- **Reproduction:** Mockup track: Hero primaryCta "Get a Free Site Mockup" -> #mockup (Hero.tsx:134; content.ts:46), Nav "Get a Free Mockup" -> #mockup (Nav.tsx:67,106), FinalCTA formCta (content.ts:197), Investment cta (content.ts:187). Audit track: AuditSection #audit, AuditPopup, StickyCTA "Book a free site audit" -> #audit (StickyCTA.tsx:15,49), pricing/services "Start with a free audit" -> /#audit.
- **Observed vs expected:** Observed: mockup (#mockup) and audit (#audit /#audit) both presented as the top action depending on surface. Expected: one primary offer site-wide.
- **Fix direction:** Pick one primary offer and demote the other to a clearly secondary path.
- **Verifier note:** All cited labels and destinations verified in code (greps confirmed Hero.tsx:134 #mockup, Nav.tsx:67/106 #mockup, StickyCTA.tsx:49 #audit, pricing/page.tsx:132 and services/page.tsx:110 "Start with a free audit"). Downgraded to LOW severity: the two offers genuinely coexist, but this is a UX/strategy judgment (audit as cold-traffic entry, mockup as hero CTA is a defensible intentional split), not a functional defect. Facts CONFIRMED; severity reflects it is an opinion-level conversion concern.

#### `CONV-10` No conversion analytics fire on any of the four funnels

**LOW** · CONFIRMED-STATIC · measurement · `src/app/layout.tsx:45`

- **Reproduction:** Grep gtag/plausible/posthog/fathom/dataLayer/@vercel/analytics across src returns only api/audit/route.ts:155 (scoring OTHER sites for analytics) and audit copy. layout.tsx loads no analytics script (verified reading it). package.json has no analytics dependency (grep returned no matches).
- **Observed vs expected:** Observed: no analytics instrumentation anywhere; no page or key-conversion events. Expected: at least page + key-conversion events.
- **Fix direction:** Add a privacy-friendly analytics script in layout and fire events at each funnel step.
- **Verifier note:** CONFIRMED statically. Read layout.tsx: it mounts ScrollProgress/CustomCursor/Nav/ScrollToTop only, no analytics. Grep across package.json for analytics/gtag/posthog/plausible/segment/mixpanel found nothing. The only analytics references in src are the audit tool detecting analytics on prospects' sites. Downgraded to LOW: this is a missing-instrumentation gap, not a functional defect; noteworthy given the audit itself dings prospects for No analytics (api/audit/route.ts).

#### `CONV-11` Care-plan subscriptions cannot be purchased anywhere; the kind=care checkout branch is unreachable

**LOW** · CONFIRMED-STATIC · funnel · `src/lib/pricing.ts:166`

- **Reproduction:** pricing.ts:166,181,196 stripeUrl empty. Plans.tsx:59 renders Subscribe only when stripeUrl is truthy. Grep for kind:care callers across src returns only checkout/route.ts (the branch + doc comment), no client caller.
- **Observed vs expected:** Observed: all carePlans[].stripeUrl are empty so no Subscribe button renders, and nothing posts kind:care, so that checkout branch is dead. Expected: a working subscribe action reaching /api/checkout kind=care.
- **Fix direction:** Populate carePlans[].stripeUrl or wire a Subscribe button to POST /api/checkout kind=care; or route intentionally to a call.
- **Verifier note:** CONFIRMED statically. Verified all three stripeUrl empty and no kind:care caller exists (grep). The care checkout branch (checkout/route.ts:29 to 47) is currently unreachable from the UI. Downgraded to LOW: pricing.ts:157 to 160 documents that empty stripeUrl intentionally hides the button until a Stripe Payment Link is pasted, so this is a launch-readiness/config state rather than a code bug. The compounding harm (care cards on /pricing then having only the dead #audit anchor) is already captured under CONV-01.

#### `CONV-12` Entry popup is maximum friction, minimum reward: a four-field gate 2.5s after landing that never shows a score

**LOW** · CONFIRMED-STATIC · funnel · `src/components/AuditPopup.tsx:49`

- **Reproduction:** AuditPopup.tsx:34 to 38 (2.5s timer), line 49 ready = url>3 && name>=2 && emailOk && agree (four fields), lines 115 to 126 done state shows only Your audit is on its way, no score. Compare AuditTool.tsx which shows the full scored result before the email ask (lines 421 to 475).
- **Observed vs expected:** Observed: popup fires 2.5s after landing, gates on url+name+email+consent, and its done state shows no score. Expected: lower-friction first ask and/or show the score as payoff.
- **Fix direction:** Reduce to url+email, or show the computed score in the done state.
- **Verifier note:** CONFIRMED statically. Verified the 2.5s setTimeout, the four-field ready gate, and that the done state renders no score. Contrast with the inline AuditTool, which shows the score first then asks for details. This is a conversion-design critique with accurate facts. Low retained.

#### `CONV-13` Delivery-timeline claims disagree across the site (about 2 weeks vs 2 to 3 vs 2 to 4)

**LOW** · CONFIRMED-STATIC · copy · `src/lib/content.ts:45`

- **Reproduction:** content.ts:45 Live in about two weeks and content.ts:49 Live In ~2 Weeks; pricing/page.tsx:32 Live in about 2 weeks while pricing.ts:32 blurb says live in 2 to 3 weeks; content.ts:167 Most projects go live in 2 to 4 weeks.
- **Observed vs expected:** Observed: three different timeline claims. Expected: one consistent range.
- **Fix direction:** Standardize the timeline copy across content.ts, pricing.ts, and the pricing page.
- **Verifier note:** CONFIRMED statically. Read all three sources: hero says about two weeks / ~2 weeks; the Launch build blurb in pricing.ts says 2 to 3 weeks (source uses an en dash in that range); whatYouGet says 2 to 4 weeks. Three inconsistent claims verified. Low retained (copy consistency). The agreement clause also targets 14 business days, a fourth phrasing.

#### `CONV-14` AuditForm success state is a soft dead end with no next step

**LOW** · CONFIRMED-STATIC · funnel · `src/components/AuditForm.tsx:53`

- **Reproduction:** AuditForm.tsx:53 to 64 success return contains only text, no CTA. AuditForm is reused by FinalCTA, MockupModal, and /contact.
- **Observed vs expected:** Observed: on success AuditForm renders only Request received / we'll reply within one business day with no onward action inside the form region. Expected: a next step (book a call, what happens next).
- **Fix direction:** Add a Book-a-call CTA and a short what-happens-next to the success view.
- **Verifier note:** CONFIRMED statically. Read AuditForm success branch: purely text, no CTA. Note the finding's own mitigation holds: FinalCTA and MockupModal keep a Calendly link outside the form and /contact keeps contact methods visible, so the dead end is softened at the page level. The success region itself still offers nothing. Low retained.

#### `CONV-15` Home page shows no price and no pricing CTA; the Investment starting-price strip is never rendered

**LOW** · CONFIRMED-STATIC · funnel · `src/components/Investment.tsx:6`

- **Reproduction:** Grep Investment across src matches only src/lib/content.ts (the copy object) and src/components/Investment.tsx itself, no import into any page/component. page.tsx (home) mounts neither Investment nor Plans (verified reading page.tsx:54 to 78).
- **Observed vs expected:** Observed: Investment.tsx is imported by nothing and home has no dollar figure or see-pricing CTA in the main flow. Expected: mount a price/pricing CTA on home, or delete the dead component.
- **Fix direction:** Mount Investment (or a compact price/pricing CTA) on home, or delete the unused component and add a pricing link in the flow.
- **Verifier note:** CONFIRMED statically. Grep confirms Investment.tsx is never imported (only self + the content.ts copy object). Read home page.tsx: no Investment and no Plans, so no price appears in the primary flow; price is reachable only via the Nav Pricing link and an incidental DemoShowcase chatbot mention. Dead component + no in-flow price confirmed. Low retained.

---

### 5. Content, Copy, Brand Voice & Legal/Compliance

_15 findings: 0 critical, 1 high, 11 medium, 3 low._

#### `CONTENT-03` Placeholder testimonial and unconsented draft quotes rendered live with 5-star ratings

**HIGH** · CONFIRMED · testimonial · `src/lib/content.ts:240`

- **Reproduction:** cd /home/user/Webfair && sed -n '224,246p' src/lib/content.ts; grep -n 'Testimonials\|Guarantee' src/app/page.tsx  # page.tsx:68 renders <Testimonials/>
- **Observed vs expected:** Observed: a fabricated placeholder testimonial (name 'Client', role 'Local service business', TODO stub) plus two DRAFT-flagged named quotes all render on the homepage with a hardcoded 5-star rating. Expected: only real, consented, finalized client quotes shown publicly.
- **Fix direction:** Remove the placeholder third card, record written consent for the named quotes (or anonymize), and drop the star rating until quotes are finalized.
- **Verifier note:** Confirmed. content.ts:224-225 marks the whole array 'DRAFT WORDING'; testimonials[2] (lines 240-245) is an outright placeholder with an inline 'TODO(Tal): add a third real client quote here', name 'Client', role 'Local service business'. Testimonials.tsx:16 maps all three and Testimonials.tsx:23-24 hardcodes a five-star string for each. page.tsx:68 renders <Testimonials/> on the homepage, and CLAUDE.md states main auto-deploys, so this is live. The placeholder card alone is a fabricated-review / FTC Endorsement-Guides exposure and justifies high on its own. The separate claim that the two named quotes (Brian/Above Air, Saar) are unconsented is supported by the DRAFT comment ('confirm ... they're OK being named publicly') but the actual consent status is NEEDS-OWNER-VERIFICATION.

#### `CONTENT-01` En dash (U+2013) house-rule breach live across 27 files, 13 user-facing

**MEDIUM** · CONFIRMED · dash-rule · `src/lib/content.ts:167`

- **Reproduction:** cd /home/user/Webfair && git grep -lc "$(printf '\xe2\x80\x93')" -- ':!package-lock.json' | wc -l  # 27; git grep -n "$(printf '\xe2\x80\x94')" -- ':!package-lock.json'  # only CLAUDE.md:9
- **Observed vs expected:** Observed: 27 committed files contain U+2013; expected zero per the owner's standing no-en-dash rule.
- **Fix direction:** Replace each U+2013 with 'to' for ranges, a comma, or a plain hyphen; wire both git grep commands as a pre-merge gate.
- **Verifier note:** Reproduced exactly. git grep counts 27 files with U+2013; the 13 user-facing ones match the candidate list (public/llms.txt:18, content.ts:167, pricing.ts:32, fence-guides.ts 33-63, fence-theme.ts 21-24, Faq.tsx:24, MetricsBand.tsx:10, RoiCalculator.tsx:51, FenceSite.tsx 53/332/370, DemoShowcase.tsx 278/576, MaterialsCalculator.tsx:50, FenceEstimator.tsx 103/116, LeadAudit.tsx:56). content.ts:167 renders 'go live in 2-4 weeks' on the homepage. Em dash gate is clean: only CLAUDE.md:9 (the rule quoting the glyph). CLAUDE.md:16 also carries a U+2013 but as the rule text quoting the character (legitimate, part of the 14 internal docs). Task history #35 ('Remove em dashes across the public site') confirms em dashes were swept but en dashes were left behind. Downgraded from high to medium: this is an explicit, repeated owner directive and it ships to production in user-facing copy, but it is stylistic/brand, not a legal or functional defect; the audit rubric reserves high for legal/compliance or broken-promise defects.

#### `CONTENT-04` Guarantee headline promises money back but body covers only the deposit, and the real 30-day refund is hidden

**MEDIUM** · CONFIRMED · guarantee · `src/lib/content.ts:251`

- **Reproduction:** cd /home/user/Webfair && sed -n '248,258p' src/lib/content.ts; sed -n '96,101p' src/lib/agreement.ts; sed -n '84,86p;140,142p' src/app/pricing/page.tsx
- **Observed vs expected:** Observed: homepage headline 'Love it, or your money back' with a body that only offers 'we refund your deposit', while the binding contract defines a separate 30-day full project-fee refund never surfaced in marketing. Expected: marketing promise matches the contract, neither stronger nor weaker.
- **Fix direction:** Either surface the 30-day full refund in marketing or change the headline to 'Love the design, or your deposit back'; resolve the NOTE(Tal).
- **Verifier note:** Confirmed on every surface. content.ts:248 carries the unresolved 'NOTE(Tal): confirm these guarantee terms'; headline (251) says 'money back' but body (252) says 'refund your deposit'. agreement.ts:96-100 defines three guarantees, including a 30-day full money-back of the project fee (line 100) that appears nowhere in marketing. pricing/page.tsx:84-86 and 141 say 'Refundable deposit' + 'love-the-design guarantee'; agreement/page.tsx:47 says 'Full refund of your deposit'. So the headline overstates (money back vs deposit-only body) while the site simultaneously understates by hiding the contract's better 30-day full-fee refund. Kept at medium: a genuine deceptive-claim/consistency risk, but soft and resolvable rather than a hard breach.

#### `CONTENT-05` Cold-email templates lack a physical postal address and in-copy opt-out (CAN-SPAM)

**MEDIUM** · CONFIRMED-STATIC · can-spam · `playbook/01-email-sequences.md:24`

- **Reproduction:** cd /home/user/Webfair && grep -n ', Tal\|YOUR MAILING ADDRESS\|opt-out\|Reply STOP' playbook/01-email-sequences.md playbook/05-instantly-campaign.md
- **Observed vs expected:** Observed: playbook/01 Sequence A and B templates sign off with only ', Tal' and carry no physical address and no opt-out in emails 1 and 2; playbook/05 templates carry an unfilled [YOUR MAILING ADDRESS] token. Expected: every sendable commercial template has a real physical mailing address and a working opt-out.
- **Fix direction:** Add a fixed signature block with the real Fox Solutions LLC mailing address and an opt-out line to every template, and fill the [YOUR MAILING ADDRESS] token in playbook/05.
- **Verifier note:** Confirmed statically. playbook/01 Sequence A emails (lines 15-42) and Sequence B (49-74) end with ', Tal' and have no postal address; emails 1 and 2 have no opt-out at all (only the breakup email 3 says 'I'll stop'). The address and opt-out exist only in the deliverability checklist (lines 94, 97), never in a template. playbook/05 steps 1-3 (lines 71-72, 92-93, 109-110) do contain a 'Not interested? Just reply and I'll stop' line but an unfilled [YOUR MAILING ADDRESS] placeholder, so a paste-as-is send omits the required address. Downgraded from high to medium: the GTM engine reads pre-launch (playbooks repeatedly say warm the domain 2-3 weeks before the first send) and both playbooks carry prominent CAN-SPAM checklists, so the breach is latent and mitigated, not live. Whether any template is sent unmodified is NEEDS-OWNER-VERIFICATION.

#### `CONTENT-06` Privacy policy omits Quo and Instantly, which both process contact PII

**MEDIUM** · CONFIRMED-STATIC · privacy-disclosure · `src/app/privacy/page.tsx:38`

- **Reproduction:** cd /home/user/Webfair && sed -n '38,46p' src/app/privacy/page.tsx; sed -n '154,175p' src/lib/quo.ts; grep -n 'exportInstantlyCSV\|instantly-leads' src/app/prospects/Board.tsx
- **Observed vs expected:** Observed: the enumerated subprocessor list names only Vercel, Supabase, Stripe, Resend, while code sends contact PII to Quo and exports lead PII for Instantly. Expected: every processor that touches personal data is listed.
- **Fix direction:** Add Quo (calls, SMS, contact sync) and Instantly (cold-email delivery) to the 'Who we share it with' list once either is active.
- **Verifier note:** Confirmed statically. privacy/page.tsx:40-45 enumerates exactly four subprocessors. quo.ts upsertQuoContact (lines 154-175) builds defaultFields with firstName, lastName, company, phoneNumbers, and emails and PATCH/POSTs them to Quo. Board.tsx:354 exportInstantlyCSV writes 'stackwrk-instantly-leads.csv' (email, company, phone, website, city, state) which playbook/05 uploads to Instantly. Because the policy chose to name specific processors, omitting two that handle PII is a real inaccuracy. Downgraded from high to medium: the quo.ts header comment says the write schema is 'reconstructed from Quo's docs, not a verified example' and Instantly sends appear pre-launch, so whether either integration is live in production (env keys set, list actually uploaded) is NEEDS-OWNER-VERIFICATION.

#### `CONTENT-07` Contradictory company-size framing: solo studio vs 'A Team Behind You' vs 'I build'

**MEDIUM** · CONFIRMED · claim · `src/lib/content.ts:51`

- **Reproduction:** cd /home/user/Webfair && git grep -niE 'solo web-development|A Team Behind You|companies I build|before I build|founder of Stackwrk. I build' -- src public
- **Observed vs expected:** Observed: 'solo web-development studio' (llms.txt:5), 'A Team Behind You' plus 'we/us' (content.ts:51 et al.), and first-person 'I build' (MetricsBand:9, guides byline, agreement/page.tsx:47) coexist on the same funnel. Expected: one consistent, honest framing of company size.
- **Fix direction:** Pick one honest voice (recommend first-person I/Tal with a supporting network) and reconcile the hero highlight, llms.txt, MetricsBand, guides byline, and the agreement.
- **Verifier note:** Confirmed on every cited surface. public/llms.txt:5 'solo web-development studio'; content.ts:51 hero highlight 'A Team Behind You' with we/us copy throughout; MetricsBand.tsx:9 '4 companies I build & operate' (rendered via page.tsx:64); guides/[slug]/page.tsx byline 'Written by Tal, founder of Stackwrk. I build...'; agreement/page.tsx:47 'you approve the design before I build' with 'Developer' singular in agreement.ts. Task history #39 ('Voice change: solo I to team we') explains how the inconsistency was introduced. Medium is appropriate: a solo operator advertising 'A Team Behind You' is soft-misleading brand incoherence, not a hard legal breach.

#### `CONTENT-08` Deceptive 're:' subject lines on cold emails the recipient never replied to

**MEDIUM** · CONFIRMED-STATIC · can-spam · `playbook/01-email-sequences.md:27`

- **Reproduction:** cd /home/user/Webfair && grep -niE 'subject:.*(re:|fwd:)' playbook/01-email-sequences.md playbook/05-instantly-campaign.md
- **Observed vs expected:** Observed: 're:' subject prefixes on step-2 follow-ups to unsolicited cold openers the recipient never answered. Expected: subjects that do not imply a prior conversation until the recipient replies.
- **Fix direction:** Drop 're:' on any message before the recipient replies (e.g. 'following up on {{business}}s website').
- **Verifier note:** Confirmed statically. playbook/01:27 'Subject: re: {{business}} + a website' and :61 'Subject: re: quick note on {{business}}s website', both Day-3 follow-ups to a Day-0 cold opener; playbook/05:77 'Subject: re: quick idea for {{company_name}}' as the Day-2 step 2. The recipient never participated in the thread, so 're:' implies a reply that never happened, a recognized CAN-SPAM materially-misleading-header risk (though there is legal debate since the sender did send a prior message). Kept at medium; live impact is contingent on actually sending, which is NEEDS-OWNER-VERIFICATION.

#### `CONTENT-09` Delivery-timeline claims conflict across marketing, the contract, and the playbooks

**MEDIUM** · CONFIRMED · timeline · `src/lib/content.ts:45`

- **Reproduction:** cd /home/user/Webfair && git grep -niE 'two weeks|2 weeks|2 to 4 week|2.4 week|2.3 week|14 business day|10 business day' -- src public playbook
- **Observed vs expected:** Observed: 'about two weeks' / '2-4 weeks' / '2-3 weeks' / '14 business days' / '10 business days' across surfaces, with playbook/03 (10 business days) directly contradicting the generated agreement (14 business days). Expected: one contract-backed number everywhere.
- **Fix direction:** Choose one commitment (e.g. 'about 14 business days after we have your content'), align content.ts, pricing.ts, MetricsBand, prospects.ts, and reconcile playbook/03 with agreement.ts.
- **Verifier note:** Confirmed. Marketing: content.ts:45 'about two weeks', :49 'Live In ~2 Weeks', :167 '2-4 weeks', :204 'Live in weeks, not months', pricing/page.tsx:32 'about 2 weeks', MetricsBand.tsx:10 '2-4', pricing.ts:32 'live in 2-3 weeks'. Contract: agreement.ts:82 and :99 'within 14 business days'. Playbooks: playbook/01:81 and prospects.ts:418 'about 10 business days', and the standalone playbook/03-service-agreement.md:22 and :33 'within 10 business days', which flatly contradicts the actual code-generated agreement's 14 business days. Medium: a real cross-surface inconsistency and a client-facing contradiction, but not a single hard breach.

#### `CONTENT-10` 'Lighthouse-grade' audit claim is not backed by the audit implementation

**MEDIUM** · CONFIRMED · claim · `src/lib/tools.ts:39`

- **Reproduction:** cd /home/user/Webfair && sed -n '38,68p' src/lib/tools.ts; grep -niE 'lighthouse|chrome|puppeteer|playwright|pagespeed' src/app/api/audit/route.ts; grep -rniE 'from .playwright' src/
- **Observed vs expected:** Observed: copy claims a 'Lighthouse-style' / 'Lighthouse-grade' scorecard, but the route computes a regex/heuristic HTML score with no Chrome and no Core Web Vitals measurement. Expected: claims that match the actual heuristic method.
- **Fix direction:** Reword to 'a fast heuristic scorecard covering the same categories a full audit looks at' and drop 'Lighthouse-grade', or actually run Lighthouse/PSI before making the claim.
- **Verifier note:** Confirmed. tools.ts:39 'Lighthouse-style scorecard', :63 'the same categories a Lighthouse audit weighs', :67 'the way a real Lighthouse-grade audit would'. api/audit/route.ts fetches raw HTML via guardedFetch and scores string matches with has/grab/count helpers (lines 16-18) over a fixed WEIGHT map {pass:100,warn:35,fail:0} (line 22). grep found zero occurrences of lighthouse/chrome/puppeteer/playwright/pagespeed in the route, and playwright is not imported anywhere in src/. It never launches a browser or measures LCP/TBT/CLS, so 'Lighthouse-grade' overstates the method. Medium: an overstated marketing claim, mild FTC substantiation risk.

#### `CONTENT-11` Unsourced conversion and revenue statistics in the calculators with no on-page disclaimer

**MEDIUM** · CONFIRMED · claim · `src/components/RoiCalculator.tsx:51`

- **Reproduction:** cd /home/user/Webfair && sed -n '45,67p' src/components/RoiCalculator.tsx; sed -n '74,81p' src/components/SaasVsCustomCalculator.tsx
- **Observed vs expected:** Observed: 'Most small-business sites convert 1-2%' drives a concrete monthly revenue projection with no source and no inline disclaimer; 'Often 10 to 15%' seat growth stated as a default. Expected: a cited source or a visible 'illustrative estimate, not a guarantee' note at the point of use.
- **Fix direction:** Add a short on-tool 'Illustrative estimate, not a guarantee of results' note under each calculator and cite or soften the benchmark figures.
- **Verifier note:** Confirmed. RoiCalculator.tsx:51 asserts 'Most small-business sites convert 1-2%' and lines 56-66 render a 'With a Stackwrk site' monthly revenue figure off that baseline with no source and no not-a-guarantee note on the tool. SaasVsCustomCalculator.tsx:79 states 'Often 10 to 15%'. terms/page.tsx:22 disclaims free tools generally, but a visitor using the calculator never sees that page, so the projection is presented as fact at the point of use. Medium: FTC deceptive/earnings-claim exposure, mitigated somewhat by soft framing ('targets ~X%') and the terms-page disclaimer, but no inline disclaimer.

#### `CONTENT-12` Placeholder social links and a legacy 'seatophomes' Calendly URL are live in the footer

**MEDIUM** · CONFIRMED · placeholder · `src/lib/content.ts:12`

- **Reproduction:** cd /home/user/Webfair && sed -n '12,17p' src/lib/content.ts; grep -n 'linkedin\|github\|calendly' src/components/Footer.tsx; git grep -n 'seatophomes' -- src public
- **Observed vs expected:** Observed: footer LinkedIn/GitHub resolve to bare linkedin.com and github.com homepages, and the public booking link is calendly.com/tal-foxamit-seatophomes. Expected: real Stackwrk profile URLs and a stackwrk-branded Calendly slug.
- **Fix direction:** Replace the bare social URLs with real Stackwrk profiles (or remove them) and move the Calendly to a stackwrk-branded slug; update content.ts, llms.txt, and the JSON-LD sameAs.
- **Verifier note:** Confirmed. content.ts:14 linkedin='https://www.linkedin.com/', :15 github='https://github.com/', :12 calendlyUrl='https://calendly.com/tal-foxamit-seatophomes/30min'. Footer.tsx:7-8 and :32-35 render the socials as external anchors and :22 renders the Calendly link; public/llms.txt:28 repeats the seatophomes URL. Bonus observation: page.tsx:42 also injects the two bare social homepages into JSON-LD 'sameAs', so the retired-brand/placeholder leak reaches structured data too. Medium: the bare social links send visitors to generic logged-out homepages and the seatophomes slug surfaces the retired brand at the moment of highest intent.

#### `CONTENT-13` Privacy and terms lack a physical address and electronic-signature consent despite a live e-sign product

**MEDIUM** · CONFIRMED-STATIC · privacy-disclosure · `src/app/terms/page.tsx:9`

- **Reproduction:** cd /home/user/Webfair && grep -niE 'address|suite|po box|e-sign|ueta|electronic signature' src/app/privacy/page.tsx src/app/terms/page.tsx; grep -n 'UPDATED =' src/app/privacy/page.tsx src/app/terms/page.tsx
- **Observed vs expected:** Observed: neither legal page lists a physical mailing address, terms has no ESIGN/UETA consent clause for the site, and both hardcode UPDATED='July 14, 2026'. Expected: a contact address, electronic-records consent language, and a maintained effective date.
- **Fix direction:** Add a physical mailing address and keep the existing rights section, add an electronic-records-and-signature consent clause to terms, and derive the UPDATED date from a maintained source.
- **Verifier note:** Facts confirmed statically. privacy/page.tsx and terms/page.tsx give only email (hello@stackwrk.com) and phone (754 551-2828), no street/PO address. terms has no ESIGN/UETA clause; the E-SIGN consent lives only in agreement.ts:142 and agreement-email.ts. Both hardcode UPDATED='July 14, 2026' (privacy:9, terms:9). Two caveats that temper the finding: privacy DOES provide a rights-request channel ('Your choices' at lines 56-62 plus 'email us to have your information deleted' at line 53), so the candidate's 'no data-subject request path' is slightly overstated, and whether a physical address / ESIGN site clause is legally required (vs best practice) is jurisdiction-dependent (CCPA/GDPR applicability is NEEDS-OWNER-VERIFICATION). Kept at medium as a completeness gap.

#### `CONTENT-02` Two decrement buttons render a lone en dash as their minus glyph

**LOW** · CONFIRMED · dash-rule · `src/components/FenceEstimator.tsx:103`

- **Reproduction:** cd /home/user/Webfair && sed -n '103p' src/components/FenceEstimator.tsx | od -An -tx1  # shows 3e e2 80 93 3c = >[U+2013]<
- **Observed vs expected:** Observed: decrement button label is byte sequence e2 80 93 (U+2013); expected an ASCII hyphen-minus or an aria-labeled icon.
- **Fix direction:** Replace the en dash with a plain hyphen and add aria-label="decrease" (and mirror aria-label="increase" on the + button).
- **Verifier note:** Byte-verified. od on both lines shows '>' e2 80 93 '<' inside <button>...</button>, i.e. a bare en dash is the only label of each 'decrease gates' control (FenceEstimator.tsx:103 and tools/MaterialsCalculator.tsx:50). The paired increment button uses a plain '+' and, notably, also has no aria-label, so the a11y gap is a broader unlabeled-control pattern, not unique to the minus. Downgraded from medium to low: real but minor, confined to secondary demo/calculator widgets; a screen reader announces the en dash poorly but the impact is small.

#### `CONTENT-14` Legal-entity / DBA wording is presented in four different forms

**LOW** · CONFIRMED · dba · `src/app/agreement/page.tsx:41`

- **Reproduction:** cd /home/user/Webfair && git grep -n 'Fox Solutions' -- src public supabase
- **Observed vs expected:** Observed: 'd/b/a Stackwrk', 'Fox Solutions LLC (Stackwrk)', 'doing business as Stackwrk', 'the trade name of Fox Solutions LLC', and bare 'Fox Solutions LLC' all in use. Expected: one canonical phrasing everywhere.
- **Fix direction:** Standardize on one form (e.g. 'Fox Solutions LLC, d/b/a Stackwrk') across contract, legal pages, and footer.
- **Verifier note:** Confirmed. 'Fox Solutions LLC, d/b/a Stackwrk' at agreement/page.tsx:41 and agreement-email.ts:55; 'Fox Solutions LLC (Stackwrk)' at agreement/page.tsx:55 (so the same rendered agreement page mixes two forms, lines 41 vs 55); 'doing business as Stackwrk' at terms/page.tsx:14; 'the trade name of Fox Solutions LLC' at privacy/page.tsx:14; bare 'Fox Solutions LLC' in the footer at content.ts:261. Low severity, as the discoverer scored it: a cosmetic legal-copy inconsistency.

#### `CONTENT-15` Mixed straight and curly apostrophes within the homepage copy source

**LOW** · CONFIRMED · typography · `src/lib/content.ts:229`

- **Reproduction:** cd /home/user/Webfair && grep -nE "it's|you're" src/lib/content.ts; grep -nP "\xe2\x80\x99" src/lib/content.ts
- **Observed vs expected:** Observed: straight apostrophes on lines 229 and 252 coexist with curly apostrophes on 157, 191, 193, 196, all rendered on the same homepage. Expected: one consistent apostrophe style in body copy.
- **Fix direction:** Normalize content.ts body copy to a single apostrophe style (curly, to match the legal pages) and keep all-caps STACKWRK to logo/hero use only.
- **Verifier note:** Confirmed. Straight apostrophes: 'it's' (line 229, testimonial) and 'you're' (line 252, guarantee body). Curly U+2019: 'don't' (157), 'Let's' (191), 'we'll' (193, 196). Testimonials.tsx and Guarantee.tsx render these adjacent on the homepage, so both glyph styles appear on one page, while privacy/terms use curly consistently. Low severity nit, as scored.

---

### 6. Analytics & Measurement

_11 findings: 2 critical, 5 high, 3 medium, 1 low._

#### `ANALYTICS-01` No web analytics tag of any kind on the public site (anchor finding)

**CRITICAL** · CONFIRMED-STATIC · analytics-instrumentation · `src/app/layout.tsx:45`

- **Reproduction:** Read src/app/layout.tsx; read package.json lines 12-18; grep -rniE 'gtag|googletagmanager|dataLayer|@vercel/analytics|SpeedInsights|plausible|posthog|next/script' src (only audit-tool/self-scan false positives).
- **Observed vs expected:** Observed: no page-view tag in code and no analytics dependency. Expected: at least one page-view tag so traffic and top pages are counted.
- **Fix direction:** Add one page-view tag in layout.tsx (Vercel Web Analytics <Analytics/> or GA4 via next/script gated on a NEXT_PUBLIC measurement id).
- **Verifier note:** Reproduced. Read layout.tsx end to end: the body mounts only ScrollProgress, CustomCursor, Nav, main, ScrollToTop (lines 48-55), no <Script>, no next/script import, no gtag/GTM/dataLayer, no @vercel/analytics or SpeedInsights. package.json dependencies (lines 12-18) are only @supabase/supabase-js, next, react, react-dom, stripe: zero analytics packages. Grep across src for gtag|googletagmanager|dataLayer|GTM-|@vercel/analytics|SpeedInsights|plausible|posthog|next/script|fbq|clarity returns only false positives inside the audit tool that scans OTHER sites (src/app/api/audit/route.ts:155) and the word 'plausible' used in Quo webhook comments. The 'confirmed on production, 63 framework scripts and none analytics' sub-claim would need a live fetch of www.stackwrk.com (NEEDS-DYNAMIC-VERIFICATION), but it is not needed: the static code + package.json fully establish that no page-view tag is shipped. Core gap confirmed.

#### `ANALYTICS-03` UTM/referrer/landing/fbclid/gclid never captured; lead source is a hardcoded per-form literal

**CRITICAL** · CONFIRMED-STATIC · channel-attribution · `src/app/api/leads/route.ts:119`

- **Reproduction:** grep -rniE 'utm_|fbclid|gclid|document.referrer' src (no capture); read leads/route.ts:7-13,119; audit-report/route.ts:90; book/route.ts:76; AuditPopup.tsx:70; schema.sql:9-19.
- **Observed vs expected:** Observed: one hardcoded source label per form, no UTM/referrer/click-id capture, no columns to store them. Expected: a first-load attribution util plus source/utm columns on leads.
- **Fix direction:** Add a shared attribution util, widen LeadBody/audit-report body, and add utm/source/referrer/landing columns via migration.
- **Verifier note:** Reproduced. /api/leads LeadBody is only name/email/website/message/company (route.ts:7-13) and the insert hardcodes source: 'audit_form' (line 119). /api/audit-report defaults source to 'instant_audit' when omitted (route.ts:90) and the AuditTool ReportCapture POST body sends only name/email/company/result, no source (AuditTool.tsx:217-222). /api/book hardcodes source: 'booking' (book/route.ts:76). AuditPopup is the only caller that sets a source ('popup_audit', AuditPopup.tsx:70). Grep of src for utm_|fbclid|gclid|document.referrer|searchParams.get(utm) returns NO MATCHES, so nothing reads window.location or posts channel data. supabase/schema.sql leads table (lines 9-19) has a single free-text source column and no utm/referrer/landing columns. An Instantly lead and a Facebook lead land with the same generic label. Most defensible finding in the set for a paid-spend business; severity critical upheld.

#### `ANALYTICS-02` No client-side conversion event fires on any funnel success path

**HIGH** · CONFIRMED-STATIC · conversion-tracking · `src/components/AuditTool.tsx:351`

- **Reproduction:** grep -rnE 'gtag\(|dataLayer|track\(|posthog|va\(' on the five components: zero conversion-event matches on any success branch.
- **Observed vs expected:** Observed: success handlers mutate React state only. Expected: a named conversion event (audit_run, report_requested, lead_submitted, booking_confirmed) on each ok path.
- **Fix direction:** Add a small event helper and call it on each success branch with a named-event dictionary.
- **Verifier note:** Reproduced. Read every cited success branch: AuditTool.run ok path sets setResult/setPhase('done') only (AuditTool.tsx:351-353); ReportCapture.submit ok path sets setEmailed/setSentTo/setFirstName/setPhase('sent') only (225-230); AuditForm.onSubmit sets setStatus('success')+form.reset() only (30-34); AuditPopup.submit sets setStatus('done')+sessionStorage only (83-84); DemoShowcase BookingDemo.submit sets setEmailed/setConfirmed/setStep('done') only (89-93). None call track()/gtag()/dataLayer.push/va(). Grep for track\(|va\( in src returns nothing analytics-related. All handlers mutate React state only. Downgraded from critical to high: this is genuinely additive to, and gated behind, ANALYTICS-01 (no tag exists to receive events), and server tables (leads/audits/payments) already give partial conversion counts, so it is one notch below the page-view anchor.

#### `ANALYTICS-04` Instantly cold-email channel is unmeasurable end to end

**HIGH** · CONFIRMED-STATIC · channel-attribution · `playbook/01-email-sequences.md:29`

- **Reproduction:** grep -nE 'demos/apex-fence' playbook/01-email-sequences.md -> lines 29,63; grep -rniE 'utm_' playbook/ MARKETING.md -> none; grep -rniE 'utm_' src -> none.
- **Observed vs expected:** Observed: campaign links carry no UTM and the site cannot read them anyway. Expected: tagged Instantly links plus a site-side reader that persists them onto lead POSTs.
- **Fix direction:** Append UTM to the playbook destination links and add the ANALYTICS-03 attribution capture so Instantly clicks join to on-site conversions.
- **Verifier note:** Reproduced. playbook/01-email-sequences.md line 29 (Sequence A email 2) and line 63 (Sequence B email 2) both send prospects to the bare 'stackwrk.com/demos/apex-fence' with no ?utm_source=instantly appended (grep confirms exact lines). grep -rniE 'utm_' across playbook/ and MARKETING.md returns NO UTM anywhere. And per ANALYTICS-03 the site has no reader for UTM params, so even tagged links would be dropped on arrival. Reply/open data lives only in Instantly with no on-site join. Confirmed.

#### `ANALYTICS-05` No Meta Pixel and no fbclid handling for the Facebook channel

**HIGH** · CONFIRMED-STATIC · channel-attribution · `src/app/layout.tsx:45`

- **Reproduction:** grep -rniE 'fbq|_fbp|connect.facebook.net|fbclid|meta pixel' src -> only the audit self-scan false positive at api/audit/route.ts:155.
- **Observed vs expected:** Observed: zero Meta Pixel and no fbclid capture. Expected: a Meta Pixel plus fbclid persisted with lead attribution.
- **Fix direction:** Add a Meta Pixel (base + Lead/Purchase events) and capture fbclid in the attribution util.
- **Verifier note:** Reproduced. grep -rniE 'fbq|_fbp|connect.facebook.net|fbclid' across src returns only the audit tool's self-scan regex that looks for fbq( on OTHER sites (src/app/api/audit/route.ts:155), never a pixel install or an fbclid reader. layout.tsx loads no pixel script. No custom/lookalike audiences or Meta conversion optimization possible. Confirmed.

#### `ANALYTICS-06` External Calendly booking (the primary site-wide CTA) is entirely unmeasured

**HIGH** · CONFIRMED-STATIC · conversion-tracking · `src/lib/content.ts:12`

- **Reproduction:** grep -rniE 'calendlyUrl' src (all plain anchors); grep -rniE 'calendly.*utm_|onClick.*calendly|/api/.*calendly|calendly.*webhook' src -> none.
- **Observed vs expected:** Observed: bare Calendly URL in plain anchors, no click event, no UTM, no webhook. Expected: UTM on the Calendly URL, a calendly_click event, and Calendly UTM/webhook for completion attribution.
- **Fix direction:** Append UTM to site.calendlyUrl, fire a calendly_click event on the anchors, and enable Calendly UTM/webhook.
- **Verifier note:** Reproduced. site.calendlyUrl is the bare 'https://calendly.com/tal-foxamit-seatophomes/30min' (content.ts:12) with no UTM. It is rendered in ~13 surfaces (Footer.tsx:22, FinalCTA.tsx:114, ToolLayout.tsx:118, SaasVsCustomCalculator.tsx:175, AuditTool.tsx:262, MockupModal.tsx:69, RoiCalculator.tsx:84, contact/page.tsx:22, guides/[slug]/page.tsx:292, guides/page.tsx:147, tools/page.tsx:122, plus book/audit-report emails). grep for calendly.*utm_|onClick.*calendly|/api/.*calendly|calendly.*webhook|track(|va( returns NONE: every reference is a plain external anchor with no click handler, no UTM, no redirect wrapper, no webhook. Completion counting could still exist inside Calendly's own dashboard (outside the repo), but on-site click/channel attribution is absent. Confirmed at the site level.

#### `ANALYTICS-07` Stripe revenue cannot be attributed to a channel or reliably joined to a lead

**HIGH** · CONFIRMED-STATIC · revenue-attribution · `src/app/api/checkout/route.ts:32`

- **Reproduction:** grep -nE 'client_reference_id|metadata' src/app/api/checkout/route.ts -> none; read webhooks/stripe/route.ts:45-52 and supabase/payments.sql -> no channel column.
- **Observed vs expected:** Observed: no client_reference_id/metadata on sessions, no channel field on payments. Expected: client_reference_id (lead id) and UTM metadata on Checkout/Payment Links, persisted on the payments row.
- **Fix direction:** Pass client_reference_id + UTM metadata into checkout and the Payment Links and store them on the payments insert.
- **Verifier note:** Reproduced. Both Checkout Session branches (subscription at checkout/route.ts:32-47 and deposit at 51-65) create sessions with no client_reference_id, no metadata, no UTM. Care-plan Payment Links are external and opened via a plain <a href={plan.stripeUrl} target=_blank rel=noopener> with no reference (Plans.tsx:61-69). The Stripe webhook builds a record of only type/email/amount/status and inserts id/type/email/amount_cents/status/created_at (webhooks/stripe/route.ts:33-52); supabase/payments.sql (lines 5-12) has columns id/type/email/amount_cents/status/created_at with no channel column. A payment joins to a lead only by email string match and never to a channel. Confirmed.

#### `ANALYTICS-08` No GSC verification token or file; robots/sitemap/canonical use the non-www apex host

**MEDIUM** · CONFIRMED-STATIC · organic-measurement · `src/app/layout.tsx:12`

- **Reproduction:** grep -niE 'verification' src/app/layout.tsx -> none; ls public/ -> no google*.html/BingSiteAuth; read robots.ts (host+sitemap = apex) and layout.tsx:37 (canonical = apex).
- **Observed vs expected:** Observed: no in-repo verification token/file, and robots/sitemap/canonical all hardcode the non-www apex host. Expected: verification confirmed (DNS or metadata), a submitted sitemap, and canonical/robots aligned to the actual serving host.
- **Fix direction:** Confirm GSC verification (DNS/metadata), submit the sitemap, and reconcile canonical/robots host with the real serving host.
- **Verifier note:** Partially reproduced, downgraded high->medium. Static facts CONFIRMED: layout.tsx metadata (lines 12-38) has no metadata.verification.google; grep for verification|google-site-verification in layout.tsx returns none; public/ contains no google*.html or BingSiteAuth.xml (only llms.txt, README, fonts, shots, webp assets). robots.ts hardcodes host: https://stackwrk.com and sitemap: https://stackwrk.com/sitemap.xml (non-www), and layout canonical is https://stackwrk.com (line 37). HOWEVER two sub-claims exceed static proof: (1) the leap 'organic is unmeasured' does not follow, because GSC verification is commonly done via a DNS TXT record or the GSC-UI meta method, neither of which would appear in the repo, so actual verification state is NEEDS-OWNER-VERIFICATION; (2) the claim that prod 308-redirects the apex to www (making apex a non-serving host) is NEEDS-DYNAMIC-VERIFICATION (I did not fetch prod per instructions). The defensible core is the host inconsistency in code and the absence of an in-repo verification token; severity lowered to medium to reflect the DNS-verification caveat.

#### `ANALYTICS-09` audits table cannot serve as a channel-segmented top-of-funnel metric

**MEDIUM** · CONFIRMED-STATIC · funnel-measurement · `src/app/api/audit/route.ts:341`

- **Reproduction:** read audit/route.ts:341 and schema.sql:29-36; grep source|session|referrer|utm in schema.sql audits section -> none.
- **Observed vs expected:** Observed: audits log is url/score/load_ms/page_kb only. Expected: source/session/referrer columns so top-of-funnel volume is channel-segmentable.
- **Fix direction:** Add source/session/referrer columns to audits and pass the attribution payload into the /api/audit insert.
- **Verifier note:** Reproduced. The audit-run log inserts only { url, score, load_ms, page_kb } (audit/route.ts:341, fire-and-forget in a try/catch). supabase/schema.sql audits table (lines 29-36) has columns id/created_at/url/score/load_ms/page_kb only, no source/session/referrer/utm. grep of schema.sql for source|session|referrer|utm on the audits table returns none. Combined with no page-view tag (ANALYTICS-01) and no visitor id, audit-run volume cannot be split by channel or landing page. Confirmed.

#### `ANALYTICS-10` Sitemap freshness signal is self-defeating and misses two public routes

**MEDIUM** · CONFIRMED-STATIC · seo-measurement · `src/app/sitemap.ts:9`

- **Reproduction:** grep -n 'lastModified = new Date' src/app/sitemap.ts (line 9); ls src/app/privacy src/app/terms (both exist); grep -niE 'privacy|terms' src/app/sitemap.ts -> not listed.
- **Observed vs expected:** Observed: all static URLs stamped with today's date; /privacy and /terms absent. Expected: stable per-route lastmod and full coverage of indexable routes.
- **Fix direction:** Use real per-route last-updated dates for static URLs and add /privacy and /terms to the sitemap.
- **Verifier note:** Reproduced. sitemap.ts line 9 sets const lastModified = new Date() and stamps it on every static URL: home, /work, /services, /pricing, /guides, /contact, /tools, and each tool slug (lines 12-24). Guide URLs correctly use new Date(g.updated ?? g.date) (lines 25-30), which makes the static-URL 'now' stamp inconsistent and self-defeating. Separately, src/app/privacy/page.tsx and src/app/terms/page.tsx both exist and are linked from AuditPopup (lines 152-153), but grep -niE 'privacy|terms' src/app/sitemap.ts returns NOT IN SITEMAP, so both indexable routes rely on discovery. Confirmed. Impact is a minor SEO/freshness signal; kept at medium.

#### `ANALYTICS-11` No env/config slot for a measurement id; adding pixels needs a privacy update

**LOW** · CONFIRMED-STATIC · instrumentation-config · `.env.example:1`

- **Reproduction:** read .env.example (no measurement var); grep -niE 'NEXT_PUBLIC_.*(GA|ANALYTICS|MEASUREMENT|PIXEL)' .env.example -> none; read AuditPopup.tsx:148-155 (consent checkbox).
- **Observed vs expected:** Observed: no measurement env slot; consent collected but no analytics disclosure planned. Expected: a NEXT_PUBLIC measurement env var scaffolded and a privacy update accompanying any tag.
- **Fix direction:** Add a NEXT_PUBLIC_ measurement id to .env.example (and Vercel) and update /privacy when a tag is enabled.
- **Verifier note:** Reproduced. .env.example defines only SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRM_ACCESS_KEY, RESEND_API_KEY, REPORT_FROM_EMAIL, REPORT_NOTIFY_EMAIL; the only NEXT_PUBLIC mention is the comment warning not to prefix the service-role key (line 4). grep -niE 'NEXT_PUBLIC_.*(GA|ANALYTICS|MEASUREMENT|PIXEL)' .env.example returns NO MATCHES, so no measurement id can be configured without adding a new var and a Vercel entry. AuditPopup already collects explicit marketing consent via a required checkbox (AuditPopup.tsx:148-155, 'I agree to receive my free audit and occasional emails'), so a GA4/Meta Pixel add also needs a matching /privacy disclosure to stay consent-aligned. Confirmed; low severity (config/process gap).

---

### 7. Business & Go-To-Market Strategy

_23 findings: 0 critical, 5 high, 13 medium, 5 low._

#### `GTM-01` Prices a prospect hears (playbook/scripts) contradict the live site and e-sign agreement

**HIGH** · CONFIRMED · pricing-coherence · `playbook/02-call-scripts.md:49`

- **Reproduction:** Verified each cited line: call-scripts.md:49 '$3,900'; 00-RUNBOOK.md:5 '($2,500 / $3,900 / $6,500) + care ($99/$199/$399/mo)' and :52 'full price ($3,900 Growth)'; 03-service-agreement.md:27 '$[2,500 / 3,900 / 6,500]' and :29 '$[99 / 199 / 399]'; 04-systems.md:15 same; START-HERE-TOMORROW.md:51,57 '$3,900'. Against pricing.ts:42 growth founding 4500 and agreement.ts:37 Growth fee 4500, care 249/499.
- **Observed vs expected:** Playbook sells $2,500/$3,900/$6,500 builds and $99/$199/$399 care; live pricing.ts and agreement.ts sell $2,000/$4,500/$8,000 and $99/$249/$499.
- **Fix direction:** Rewrite every playbook/script price to the canonical $2,000/$4,500/$8,000 and $99/$249/$499, ideally sourced from the price book.
- **Verifier note:** Reproduced every cited line by Read+grep. The Growth build is $3,900 in all outreach vs $4,500 in the binding agreement (agreement.ts:37, buildAgreement), and care is $199/$399 in the playbook vs $249/$499 live. A prospect quoted $3,900 on the phone then handed a $4,500 e-sign agreement is a real close-friction defect. Note an internal inconsistency even within START-HERE-TOMORROW.md:57 ($3,900 build but $249/mo care). Downgraded critical->high: it is a copy/doc inconsistency that creates friction and is recoverable in conversation, not a system failure.

#### `GTM-02` Audit-report / lead-alert / booking / agreement emails cannot send (Resend unconfigured), UI still says delivered

**HIGH** · CONFIRMED-STATIC · activation-blocker · `src/lib/email.ts:56`

- **Reproduction:** email.ts:55-56 early-returns not_configured when !RESEND_API_KEY. book/route.ts:104 returns ok:true with emailed:send.sent (false). audit-report/route.ts:138 same. AuditPopup.tsx:83 sets status 'done' and line 122-123 renders 'Your audit is on its way ... 10% founding discount is locked in' regardless of the emailed flag. TODO.md:49-52 states stackwrk.com is unverified in Resend so these do not send.
- **Observed vs expected:** When RESEND_API_KEY is unset, sendEmail returns {sent:false,reason:not_configured}; callers still return ok:true and the popup UI still says 'on its way'.
- **Fix direction:** Set RESEND_API_KEY + verified REPORT_FROM_EMAIL in Vercel and surface send failure to the popup UI instead of always showing 'on its way'.
- **Verifier note:** Statically confirmed the code path and the misleading UX (API and popup both claim success on a silent no-send). Whether RESEND_API_KEY is actually set in Vercel production cannot be verified from the repo; the committed docs (TODO.md:49-52, DELIVERY.md:106-115) indicate it is not yet configured. Live prod status is owner-verifiable. Severity high: the flagship audit-to-emailed-report motion is inert and the UI actively promises delivery.

#### `GTM-03` Inbound lead capture and bookings dropped when Supabase unconfigured

**HIGH** · CONFIRMED-STATIC · activation-blocker · `src/app/api/leads/route.ts:111`

- **Reproduction:** supabase.ts:13-16 returns null when SUPABASE_URL/SERVICE_ROLE_KEY unset. leads/route.ts:107-112 -> 503. book/route.ts:70-80 sets stored=false, returns ok:true (line 104). audit-report/route.ts:96-107 skips storage, returns ok:true (line 138). PLAN.md:78 'no Stackwrk project exists yet'; DELIVERY.md:106-110 lists it as owed setup.
- **Observed vs expected:** POST /api/leads returns 503 not_configured when Supabase env is unset; /api/book and /api/audit-report skip the insert (stored=false) but still return ok:true.
- **Fix direction:** Provision the Stackwrk Supabase project, run the schema, set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRM_ACCESS_KEY in Vercel.
- **Verifier note:** Confirmed the graceful-degrade code paths and the ok:true-with-stored:false behavior for book/audit-report, plus the hard 503 for /api/leads (which the homepage mockup form hits directly). Whether the three Supabase env vars are set in prod is owner-verifiable; committed docs indicate they are not. Severity high: with env unset, every mockup, booking, and audit lead is lost and /crm is empty.

#### `GTM-12` Unverified/placeholder testimonials with real names plus 'team'/'trusted by' claims on a solo pre-revenue business

**HIGH** · CONFIRMED · proof-and-claims · `src/lib/content.ts:224`

- **Reproduction:** content.ts:224-246 DRAFT comment + real names (Brian/Above Air A/C, Saar/Fort Lauderdale Dock Rental) + placeholder 'Client / Local service business' with a TODO. content.ts:51 'A Team Behind You'; :199 'Trusted by contractors and local businesses across South Florida'. STRATEGY.md:148 'Zero paying customers yet' as risk #1. Confirmed rendered: page.tsx:11,68 import and render <Testimonials/>.
- **Observed vs expected:** Live homepage ships DRAFT named testimonials (consent unconfirmed) plus a literal placeholder quote, alongside 'A Team Behind You' and 'Trusted by contractors ... across South Florida', while the strategy doc says zero paying customers.
- **Fix direction:** Get written consent for named quotes or anonymize, remove the placeholder third quote, and soften 'team'/'trusted by' until literally true.
- **Verifier note:** Reproduced and confirmed the component is actually rendered on the homepage (page.tsx:68), so these are live. The live literal placeholder testimonial ('Client / Local service business') and named quotes with an explicit 'confirm they're OK being named publicly' DRAFT flag create a real consent/false-attribution risk; 'Trusted by ... across South Florida' on a pre-revenue solo business is a false-advertising/puffery risk. Severity high given named-individual and legal exposure.

#### `GTM-13` Closing promise 'live in ~10 business days' contradicts the binding agreement's 14 business days

**HIGH** · CONFIRMED · delivery-promise · `src/lib/agreement.ts:99`

- **Reproduction:** agreement.ts:82 'within 14 business days' and :99 on-time guarantee at 14. Against prospects.ts:418 'about 10 business days'; 01-email-sequences.md:81 '~10 business days'; 03-service-agreement.md:22,33 '10 business days'; 00-RUNBOOK.md:17 'launch in 10 days'; 04-systems.md:41 'launch in 10 days'.
- **Observed vs expected:** Outreach, CRM mockup template, and playbooks promise 10 business days; the e-signed agreement guarantees 14.
- **Fix direction:** Standardize on one figure and update agreement.ts, the CRM template, and all outreach copy to match.
- **Verifier note:** Reproduced every cited line. The sales/CRM/playbook promise (10 business days, with a '10 days or a free month' guarantee) is undercut by the actually-signed agreement's 14-business-day term and 14-day guarantee. That is a genuine promise-vs-contract exposure (a client can point to the emailed 10-day promise). Severity high because the discrepancy lives in a binding legal document.

#### `GTM-04` Two independent hardcoded build-price tables, not one source of truth

**MEDIUM** · CONFIRMED-STATIC · pricing-coherence · `src/lib/agreement.ts:35`

- **Reproduction:** grep: agreement.ts has zero imports; pricing.ts has zero imports. pricing/page.tsx:12,103 imports PLAN_PRESETS from agreement.ts. services/page.tsx:9,73 imports priceItems from pricing.ts. Values happen to match (Launch 2000/3000, Growth 4500/6500, top 8000/12000). PRICING-BENCHMARKS.md:95 claims '/quote pulls from the same src/lib/pricing.ts price book as the public page, one source of truth, no drift.'
- **Observed vs expected:** /pricing renders build tiers from PLAN_PRESETS (agreement.ts); /services renders from priceItems (pricing.ts). Neither file imports the other.
- **Fix direction:** Derive PLAN_PRESETS from priceItems (or vice versa) so build tiers share one origin.
- **Verifier note:** Confirmed the two tables are truly independent (no cross-import) and currently agree, so this is a latent drift risk rather than a live mismatch. The doc claim is technically about /quote (which does use pricing.ts) but is misleading because the public /pricing build tiers are driven by agreement.ts. Downgraded high->medium: no current customer-visible discrepancy, only maintainability risk.

#### `GTM-05` Strategy doc names a different ICP (real-estate/marine) than the fence-first operational machine

**MEDIUM** · CONFIRMED · positioning · `STRATEGY.md:46`

- **Reproduction:** STRATEGY.md:46-47 'real estate / marine-boating (SeaTop, YatHub) and local services'. content.ts:38 hero.eyebrow 'Websites for fence & exterior contractors'. TODO.md:3 'start with fencing'. MARKETING.md:39-40 'real-estate/marine + local services'.
- **Observed vs expected:** STRATEGY.md:46-48 and MARKETING.md:39 name real-estate/marine-boating + local services as the beachhead; the hero, playbooks, lead CSVs, TODO, and demo are all fence/exterior.
- **Fix direction:** Rewrite STRATEGY.md section 2 and MARKETING.md section 2 to the fence/exterior ICP, or document the pivot explicitly.
- **Verifier note:** Reproduced all cited lines. The guiding strategy and internal marketing docs were not updated when the business narrowed to fence, so the north-star ICP disagrees with every operational asset. It is a documentation-coherence defect (the ops assets are internally consistent on fence); downgraded high->medium accordingly.

#### `GTM-07` Care-plan MRR has no self-serve billing; the care checkout branch has no caller

**MEDIUM** · CONFIRMED-STATIC · activation-blocker · `src/lib/pricing.ts:166`

- **Reproduction:** pricing.ts:166,181,196 stripeUrl:''. Plans.tsx:59 ternary -> falls back to 'Start with a free audit'. grep 'api/checkout' src returns only SignBlock.tsx:56, whose body is kind:'deposit' (line 58), not kind:'care'.
- **Observed vs expected:** All carePlans[].stripeUrl are empty so no 'Subscribe now' button renders; the /api/checkout kind:'care' branch exists but nothing calls it.
- **Fix direction:** Create the 3 Stripe Payment Links into carePlans[].stripeUrl, or wire a care card / handoff flow to POST /api/checkout {kind:'care'}.
- **Verifier note:** Confirmed with a correction that strengthens the finding: the discoverer said the care path is 'only ever called from SignBlock', but SignBlock actually posts kind:'deposit'. The kind:'care' subscription branch in checkout/route.ts:29-47 has NO caller anywhere in the codebase, so there is neither a self-serve nor a post-signature way to start a care subscription today. This is a documented pending activation (DELIVERY.md:51-56, STRATEGY.md:191) plus dead-branch wiring. Severity medium: recurring MRR (called 'the actual business') has zero working start path in shipped code.

#### `GTM-08` Every 'Book a call' CTA sends a Stackwrk prospect to a SeaTop Homes Calendly

**MEDIUM** · CONFIRMED · brand-integrity · `src/lib/content.ts:12`

- **Reproduction:** content.ts:12 defines the seatophomes calendly URL. grep 'calendlyUrl' src = 13 usages (FinalCTA, Footer, ToolLayout, SaasVsCustomCalculator, AuditTool, MockupModal, RoiCalculator, book/route:88, audit-report/route:116, contact, guides/[slug], guides/page, tools/page) plus the definition.
- **Observed vs expected:** site.calendlyUrl is calendly.com/tal-foxamit-seatophomes/30min, a SeaTop Homes link, used at every booking touchpoint on a Stackwrk-branded site.
- **Fix direction:** Create a Stackwrk-branded Calendly and replace the constant at content.ts:12.
- **Verifier note:** Reproduced the constant and all 13 consumer surfaces. At the highest-intent moment the prospect sees an off-brand seatophomes.com booking page (Tal's other business). Flagged as pending in DELIVERY.md:117 and MARKETING.md:87 but still live. Severity medium (brand/trust, single-constant fix).

#### `GTM-09` Cold-email sending domain is undecided across docs; warmup readiness unverifiable

**MEDIUM** · CONFIRMED-STATIC · lead-gen-readiness · `MARKETING.md:35`

- **Reproduction:** grep: MARKETING.md:35,88 foxwrk.com; 00-RUNBOOK.md:26 getstackwrk.com; 01-email-sequences.md:6 getstackwrk.com and :92 getstackwrk.com/stackwrkhq.com; 04-systems.md:7 getstackwrk.com/stackwrkhq.com.
- **Observed vs expected:** MARKETING.md names foxwrk.com; the playbooks name getstackwrk.com and stackwrkhq.com. No single warming domain is settled.
- **Fix direction:** Pick one cold-sending domain, register it, set SPF/DKIM/DMARC, start warmup, and make every doc name that one domain.
- **Verifier note:** The doc inconsistency (three candidate domains) is statically confirmed. Whether any domain is actually registered and warming (the 2-3 week critical-path item) cannot be checked from the repo and is owner-verifiable. Severity medium: warming the wrong or an undecided domain wastes the longest lead-time item.

#### `GTM-10` Verified cold-email list holds about 1 to 2 days of fuel vs the 30/day plan

**MEDIUM** · CONFIRMED-STATIC · lead-gen-readiness · `instantly-fence-leads.csv:1`

- **Reproduction:** csv.DictReader(instantly-fence-leads.csv)=47 rows. guessed-emails-to-verify.csv=53 data rows (finding said 52; off by one). 05-instantly-campaign.md:35-36 itself states 25-30/inbox/day and 'this list finishes in ~1 day across 2 inboxes'. MARKETING.md:40 plans 30/day.
- **Observed vs expected:** 47 verified emails plus ~52 unverified guesses (with ~30-50% expected survival) against a 30/day, 5-day/week plan.
- **Fix direction:** Treat email as a phone-first-plus-list-building engine near term; scale sends only after Outscraper/Apollo enrichment grows the verified list.
- **Verifier note:** Counts reproduced against the real files (47 verified; 53 not 52 guesses). The '1-2 days of fuel' interpretation is directly corroborated by the campaign doc's own admission that the list finishes in a day. This is an analytical go-to-market readiness observation rather than a code defect; downgraded high->medium.

#### `GTM-11` CAN-SPAM gaps: unresolved mailing-address placeholder and a promotional report email with no address/opt-out

**MEDIUM** · CONFIRMED · compliance · `playbook/05-instantly-campaign.md:71`

- **Reproduction:** grep 'YOUR MAILING ADDRESS' playbook/05-instantly-campaign.md -> lines 71,92,109. audit-report.ts:175-179 promotional CTA ('Want me to fix these for you? ... Grab a free 30-minute call'); footer 185-189 shows only 'Stackwrk / stackwrk.com', no address, no unsubscribe.
- **Observed vs expected:** Cold-send signatures still contain literal [YOUR MAILING ADDRESS]; the audit-report email footer carries a promotional CTA but no postal address and no opt-out.
- **Fix direction:** Fill a real Fox Solutions LLC postal address in the cold sends, and add a physical address + opt-out line to the audit-report email footer.
- **Verifier note:** Both facts reproduced. Two nuances that temper it: (1) the cold-email copy DOES include an opt-out line ('Not interested? Just reply and I'll stop', 05:72,93,110) and the address is an explicitly-flagged fill-in the doc tells Tal to replace before sending, so the cold path's real gap is only the unfilled address; (2) the audit-report email is sent in response to a user who requested their report, so whether CAN-SPAM's commercial-email address+opt-out rule strictly applies is arguable (its promotional CTA pushes it toward commercial). The sharpest confirmed defect is the report email footer lacking any address or opt-out. Severity medium.

#### `GTM-14` The same $8,000 top build tier has two different public names

**MEDIUM** · CONFIRMED · pricing-coherence · `src/lib/pricing.ts:48`

- **Reproduction:** pricing.ts:47-52 label 'Custom App / Platform' founding 8000 (rendered by services/page.tsx). agreement.ts:38 'Market Leader' fee 8000 (rendered by pricing/page.tsx tiers keyed Launch/Growth/Market Leader).
- **Observed vs expected:** The $8,000 build is 'Market Leader' on /pricing and 'Custom App / Platform' on /services; likewise Launch vs Launch Site and Growth vs Growth Site.
- **Fix direction:** Pick one name per tier and use it in both pricing.ts labels and agreement.ts keys/pages.
- **Verifier note:** Reproduced: two public pages present the same three price points under different tier names. A prospect comparing /pricing and /services sees mismatched product names at identical prices. Severity medium (confusion, not breakage).

#### `GTM-15` /services shows no struck-through anchor price, contradicting the documented anchoring strategy

**MEDIUM** · CONFIRMED · pricing-coherence · `src/app/services/page.tsx:30`

- **Reproduction:** services/page.tsx:30-35 priceLabel builds parts from it.founding and it.monthlyFounding only; it.standard is unused on the page. PRICING-BENCHMARKS.md:90 'Services grid shows the standard rate struck through next to the live founding rate.' Contrast pricing/page.tsx:117 which does render line-through money(p.listFee).
- **Observed vs expected:** services priceLabel emits only the founding number (and monthly); it.standard is never rendered, so no strike-through anchor appears, though PRICING-BENCHMARKS.md:90 says it does.
- **Fix direction:** Extend priceLabel to render a struck-through it.standard when standard > founding, matching /pricing.
- **Verifier note:** Reproduced: the standard rate is never referenced in the services page, so the founding discount is invisible there while the doc claims it is shown. The strike-through only exists on /pricing. Severity medium (missing conversion anchor + inaccurate doc).

#### `GTM-17` Headline revenue math is not reproducible: care-attach and year-1 figures disagree across docs

**MEDIUM** · CONFIRMED · financial-model · `playbook/00-RUNBOOK.md:75`

- **Reproduction:** STRATEGY.md:101 and :110 '>=60%'; MARKETING.md:12 '>=60%'; DELIVERY.md:34,37 '>=60%'. 00-RUNBOOK.md:75 '~85% attach' and :75 'avg build ~$3,500'. TODO.md:106 'Year 1 ~$116-120k'; 00-RUNBOOK.md:78 '~$91k in builds'.
- **Observed vs expected:** Care attach is 60% in STRATEGY/MARKETING/DELIVERY but ~85% in the RUNBOOK; build-price basis is $3,500 avg in the RUNBOOK vs $4,500 Growth elsewhere.
- **Fix direction:** Fix one attach rate and one build-price basis, re-derive year-1 once, and reference that single figure everywhere.
- **Verifier note:** The attach-rate contradiction (60% vs 85%) and the build-price-basis inconsistency ($3,500 vs $4,500) are cleanly reproduced and are genuine. Nuance: the $116-120k (TODO, 'build + care fees') vs $91k (RUNBOOK, 'in builds' only) figures measure different scopes, so that specific dollar comparison is weaker than stated, but the assumptions feeding them still disagree. Severity medium.

#### `GTM-18` Cold-email icebreaker is templated and the shipped list is em-dash-laden

**MEDIUM** · CONFIRMED · lead-gen-readiness · `src/app/prospects/Board.tsx:76`

- **Reproduction:** Board.tsx:76-80 gapFor returns exactly two sentences (hasSite / no-site) with only city swapped; Board.tsx:373 exports gapFor(p) as the icebreaker column. Python over instantly-fence-leads.csv: 47 rows, 4 distinct opening-template families, 26/47 rows contain U+2014 (0 en dashes).
- **Observed vs expected:** gapFor() produces two hardcoded sentences exported as the {{icebreaker}}; the shipped CSV collapses to a few opening templates and 26 of 47 icebreakers contain an em dash.
- **Fix direction:** Generate icebreakers from a real per-lead signal and strip em/en dashes before export.
- **Verifier note:** Ran the real CSV through Python: confirmed 47 rows, ~4 opening templates, and exactly 26 em-dash rows (violating the project's standing no-em-dash rule). One nuance: the shipped CSV's icebreakers do NOT match the current gapFor() output (they are richer 4-template text), so the shipped list predates the current generator; a fresh export today would emit the two dash-free gapFor sentences instead. Both defects are real (templated openers now; em dashes in the shipped list). Severity medium.

#### `GTM-21` Entry-popup '10% off your build' is ambiguous and unbacked by any discount logic

**MEDIUM** · CONFIRMED · pricing-coherence · `src/components/AuditPopup.tsx:134`

- **Reproduction:** AuditPopup.tsx:123,134,138 and AuditSection.tsx:21 promise 10%; promo in content.ts:30-35. Lead stored with note 'Popup: wants 10% founding discount' (AuditPopup.tsx:70,79). agreement.ts buildAgreement applies only a manual listFee/projectFee discount (no 10% arithmetic). Founding discount computed: Launch 33%, Growth 31%, top 33% off list.
- **Observed vs expected:** The popup and audit section promise '10% off your build' / 'your 10% founding discount is locked in', but no code applies 10%, and the founding rate is already ~31-33% off list.
- **Fix direction:** Either drop the separate 10% claim (the founding rate is the discount) or make 10% a concrete applied line in the agreement generator.
- **Verifier note:** Reproduced the copy and confirmed no code applies a 10% reduction anywhere; the agreement discount is a manual slider. Layered on an already ~31-33% founding discount, '10% off' is undefined (off list, off founding, or additive) and unenforced, risking a broken promise at close. Severity medium.

#### `GTM-22` Guides all dated today (zero authority) with a broad-SMB query set aimed away from the fence ICP

**MEDIUM** · CONFIRMED-STATIC · seo-channel · `src/lib/guides.ts:121`

- **Reproduction:** grep 'date:|updated:' guides.ts: every entry 2026-07-16 (today). Cluster distribution: own-it 3, automation 3, crm 3, internal-tools 3, integrations 2, websites 1, ai 0 (15 total). No fence-specific cluster.
- **Observed vs expected:** All 15 guides carry identical date/updated of 2026-07-16, and the cluster mix targets broad SMB topics with 0 fence-specific guides.
- **Fix direction:** Re-budget guides as a Stage-B channel and, if run now, add fence-specific guides matching the outreach ICP.
- **Verifier note:** Facts reproduced exactly (all guides same-day dated; 14 broad-SMB vs 1 websites, 0 fence). The concrete misalignment with the fence outreach ICP and the same-day publish (no ranking authority) are real; the conclusion that content is a Stage-B channel and time-to-rank exceeds the 90-day window is reasonable analysis rather than a hard defect. Severity medium.

#### `GTM-06` Two competing free wedges (mockup vs audit) with no unified handoff

**LOW** · PLAUSIBLE · funnel · `src/lib/content.ts:46`

- **Reproduction:** content.ts:46,187,195 'Get a Free Site Mockup', :208 'Free mockup'; AuditSection.tsx:21, Plans.tsx:82, pricing/page.tsx:132 'Start with a free audit'. MARKETING.md:42-50 and PLAN.md:28 describe an audit-led cold sequence.
- **Observed vs expected:** Home hero/finalCta/howItWorks lead with 'Free Site Mockup'; audit section, /pricing, /services CTAs lead with 'Start with a free audit'.
- **Fix direction:** Pick one primary free wedge for the hero and sequence the other as a follow-on; reconcile MARKETING.md's audit-led sequence with the mockup-led playbook.
- **Verifier note:** The on-site two-wedge split is real and reproduced. BUT the finding's central mechanism ('a prospect clicks a cold email promising an audit score and lands on a mockup hero') is refuted: the actually shipped cold emails (playbook/01-email-sequences.md, playbook/05-instantly-campaign.md) and the runbook one-liner (00-RUNBOOK.md:15-17) lead with the free MOCKUP, matching the hero. The audit-led sequence exists only in the internal MARKETING.md/PLAN.md, which the playbook does not implement. So there is no cold-email-to-landing discontinuity as described; the remaining issue is a minor on-site focus inconsistency. Downgraded to low.

#### `GTM-16` Public /services offer surface is broader than the Stage-A wedge the strategy prescribes

**LOW** · CONFIRMED-STATIC · positioning · `src/app/services/page.tsx:21`

- **Reproduction:** services/page.tsx:21-28 GROUPS = build/automation/ai/crm/growth/cto. pricing.ts:139-150 fractional-cto. STRATEGY.md:115-124 later-stage ranking; :173 day-90 gate 'do not add services, narrow instead'.
- **Observed vs expected:** /services publicly lists Websites, Automations, AI Assistant, Custom CRM, Growth Systems, and Fractional CTO; STRATEGY.md ranks CTO/vertical-SaaS as later-stage and says to narrow, not add.
- **Fix direction:** Hide or de-emphasize non-Stage-A categories on the public /services page until validated.
- **Verifier note:** The facts are reproduced (six service groups including Fractional CTO are publicly listed). Whether this is a defect is a positioning judgment grounded in the strategy doc, not a functional bug; the strategy does argue for a narrower Stage-A surface. Kept as CONFIRMED-STATIC but downgraded to low since it is an editorial/strategic choice, not a malfunction.

#### `GTM-19` Orphan financing offer ($0 down + $199/mo x12) exists only in a playbook

**LOW** · CONFIRMED · pricing-coherence · `playbook/03-service-agreement.md:28`

- **Reproduction:** 03-service-agreement.md:28 offers the plan. buildAgreement (agreement.ts:63-148) has only deposit/balance, no installment path. FenceSite.tsx:55,332 '$0-down ... 12 to 60 months' is the Apex demo's homeowner fence financing, a client-facing feature, not the Stackwrk build-payment plan.
- **Observed vs expected:** A '$0 down + $199/mo for 12 months' build-payment plan appears only in playbook/03; it is absent from pricing.ts, agreement.ts, and /pricing.
- **Fix direction:** Either add an installment option to agreement.ts and the price book, or remove the plan from playbook/03.
- **Verifier note:** Reproduced: the build-payment financing plan has no price-book line and no agreement clause to bill or enforce it, and the FenceSite references are correctly identified as a different (demo homeowner) financing. If Tal quotes it there is nothing to back it. Low severity (an unused optional line, easily removed or added).

#### `GTM-20` 'Founding-client rates: first 5 clients only' has no counting or expiry mechanism

**LOW** · CONFIRMED · pricing-coherence · `src/components/Plans.tsx:26`

- **Reproduction:** Plans.tsx:24-27 and pricing/page.tsx:96-99 render the static badge. No client-count state or standard-rate flip exists in pricing.ts or the pages; the founding->standard step-up lives only in PRICING-BENCHMARKS.md.
- **Observed vs expected:** A static 'first 5 clients only' badge appears with no client counter and no code that flips founding to standard pricing.
- **Fix direction:** Track closed-client count or set a dated expiry and surface the standard rate once it passes.
- **Verifier note:** Reproduced: the urgency claim is unfalsifiable and nothing ends the founding rate after 5 closed clients, so it quietly becomes a permanent discount. Low severity (marketing puffery, not a functional break).

#### `GTM-23` AI Assistant is sold on /services but its guides cluster is empty and hidden

**LOW** · CONFIRMED · content-coverage · `src/lib/guides.ts:85`

- **Reproduction:** guides.ts:85 defines cluster id 'ai'; clusterId distribution shows no 'ai' entry (0 guides). pricing.ts:117-126 ai-assistant founding 1500 + 150/mo, rendered by services/page.tsx:24. guides/page.tsx:61 publishedClusters filters to clusters with length>0, so 'ai' renders nothing.
- **Observed vs expected:** The 'ai' cluster is defined but has zero guides, while /services actively sells an AI Assistant at $1,500 + $150/mo; empty clusters are hidden on /guides.
- **Fix direction:** Add at least one 'ai' cluster guide feeding the AI Assistant offer, or remove the empty cluster definition.
- **Verifier note:** Reproduced: the sold AI service has no supporting guide content and the empty cluster is silently hidden. Minor content-coverage gap. Severity low.

---

### 8. Performance & Core Web Vitals

_11 findings: 0 critical, 0 high, 5 medium, 6 low._

#### `PERF-01` Static image assets served with no browser caching (Vercel default max-age=0, must-revalidate)

**MEDIUM** · CONFIRMED-STATIC · caching · `/home/user/Webfair/next.config.mjs:1`

- **Reproduction:** cat /home/user/Webfair/next.config.mjs (no headers()); grep -rn 'next/image' src -> 0; ls -la public/fox.webp -> 340620. Live header via curl -sIL https://www.stackwrk.com/fox.webp (not run here).
- **Observed vs expected:** Observed: no headers() override and un-fingerprinted /public images, so image assets fall to Vercel's default max-age=0 revalidation. Expected: long-lived immutable cache on content-stable images.
- **Verifier note:** Read next.config.mjs: only reactStrictMode + poweredByHeader, no headers() rule (confirmed). grep next/image across src = 0 matches, so no optimizer path to immutable/fingerprinted URLs. /public images are un-hashed (fox.webp = 340620 bytes, confirmed via ls). The config-level defect (no cache override, un-fingerprinted assets) is certain by static analysis. The exact served header (public, max-age=0, must-revalidate) is Vercel's documented default for /public and would be confirmed with the candidate's curl against prod, which I did not run (told not to hit the live domain). One nuance: with a strong ETag, repeat views revalidate as 304 round-trips rather than full re-downloads, so the penalty is per-navigation round-trip latency plus cold-cache re-fetch, not literally re-downloading every byte every time. finalSeverity medium stands.

#### `PERF-02` Decorative fox images downloaded eagerly on mobile where the element is display:none

**MEDIUM** · CONFIRMED-STATIC · image-delivery · `/home/user/Webfair/src/app/services/page.tsx:48`

- **Reproduction:** grep -rn 'loading="eager"' src/app/services/page.tsx src/app/pricing/page.tsx src/app/work/page.tsx; sed -n '46p' src/app/services/page.tsx; ls -la public/fox-run.webp public/fox-proud.webp.
- **Observed vs expected:** Observed: mobile/tablet downloads a 158 to 176 KB decorative fox on 3 routes where its wrapper is display:none. Expected: lazy (as /tools already does), so a display:none subtree never triggers the fetch.
- **Verifier note:** Confirmed all three: services/page.tsx:48 (/fox-run.webp, 158398 bytes) inside wrapper line 46 'hidden w-[20%] max-w-[220px] xl:block'; pricing/page.tsx:71 (/fox-proud.webp, 176428 bytes) inside line 69 'hidden w-[22%] ... xl:block'; work/page.tsx:26 (/fox-proud.webp, 176428 bytes) inside line 24 'hidden w-[20%] ... xl:block'. All carry loading="eager". Contrast tools/page.tsx:73,93 which use loading="lazy". Browser behavior verified from spec: an eager (or default) <img> inside a display:none subtree is still fetched by the preload scanner, whereas loading="lazy" defers images that are in a display:none/off-viewport subtree. So the waste is real on every sub-1280px viewport for these 3 routes. Real, easily fixable, and the /tools inconsistency shows it is an oversight.

#### `PERF-03` Hero fox rendered as two eager fetchPriority=high <img> tags, causing a redundant download

**MEDIUM** · CONFIRMED-STATIC · image-delivery · `/home/user/Webfair/src/components/HeroMedia.tsx:34`

- **Reproduction:** grep -n 'loading="eager"\|fetchPriority' src/components/HeroMedia.tsx; grep -n 'HeroMedia' src/components/Hero.tsx; ls -la public/fox.webp public/fox-620.webp (340620 / 129916).
- **Observed vs expected:** Observed: on a wide desktop the visible bleed img loads fox.webp (340620 B) while the hidden lg:hidden panel img still loads fox-620.webp (129916 B), both eager+high at the LCP moment. Expected: one prioritized hero image; the breakpoint-hidden variant not eager/high.
- **Verifier note:** Confirmed HeroMedia mounts twice: Hero.tsx:103 variant="bleed" inside the 'hidden ... lg:block' wrapper (line 99), and Hero.tsx:176 default panel inside the 'lg:hidden' wrapper (line 175). Both <img> use loading="eager" + fetchPriority="high" (HeroMedia.tsx:40-42 bleed, 71-73 panel) and both render in the initial SSR HTML (HeroMedia is a client component with no ssr:false, initial state failed=false so the img is emitted). Traced the srcset/sizes math: bleed sizes=(max-width:1024px) 0px, 46vw -> on a >~1348px viewport 46vw exceeds 620px so it selects the 1000w candidate = fox.webp; panel sizes=(max-width:640px) 300px, 384px -> 384px at 1x selects the 620w candidate = fox-620.webp. Two different URLs, both eager+high, both fetched by the preload scanner even though the panel is display:none on desktop. Caveat noted in verifierNote: on viewports 1024 to ~1348px both variants resolve to fox-620.webp and dedupe to a single request; the two-file waste applies to typical 1440px+ desktops. Strongest of the image findings.

#### `PERF-04` LCP headline font (Anton) is not preloaded and has no metric overrides

**MEDIUM** · CONFIRMED-STATIC · font-loading · `/home/user/Webfair/src/app/layout.tsx:48`

- **Reproduction:** grep -rn 'preload' src -> none; grep -n 'size-adjust\|ascent-override\|font-display' src/app/globals.css; sed -n '115,117p' src/components/Hero.tsx.
- **Observed vs expected:** Observed: self-hosted Anton woff2 is discovered only after CSS parse (no preload) and swaps with no size/ascent/descent override against the Impact/Haettenschweiler fallback. Expected: preloaded LCP font plus @font-face metric overrides so the swap causes no shift.
- **Verifier note:** Confirmed: globals.css:9-28 declares two Anton @font-face blocks with font-display: swap (lines 13, 23) and no size-adjust / ascent-override / descent-override. layout.tsx renders <body> with no <head> or <link rel=preload>; grep -rn 'preload' src returns 0 (only rel=noopener elsewhere). tailwind.config.ts:43 sets fontFamily.display = [Anton, Haettenschweiler, Impact, sans-serif], so the pre-swap fallback is a metrically different condensed face and the H1 (Hero.tsx:116 className includes font-display) will reflow on swap. The static best-practice gaps (no preload, no metric overrides) are objectively true. The magnitude of the LCP delay / CLS contribution is a field-measurement question and the 'likely mobile LCP element' is a reasonable but unproven hypothesis; the defect itself is confirmed. finalSeverity medium.

#### `PERF-05` No image optimization pipeline: heaviest assets shipped full-size, no AVIF or responsive variants

**MEDIUM** · CONFIRMED-STATIC · image-delivery · `/home/user/Webfair/next.config.mjs:2`

- **Reproduction:** grep -rn 'next/image' src | wc -l -> 0; find public -name '*.avif' | wc -l -> 0; ls -la public/*.webp.
- **Observed vs expected:** Observed: raw <img> everywhere, no images config, no AVIF, decorative foxes single fixed webp with no srcset. Expected: AVIF plus width-appropriate responsive variants.
- **Verifier note:** Confirmed: grep 'next/image|next/dynamic' across src = 0 matches; next.config.mjs has no images key; find public -name '*.avif' = 0 files; the decorative fox <img> tags (services:48, pricing:71, work:26 and the HowItWorks/FinalCTA/tools uses) are plain src with no srcset. fox.webp = 340620 bytes, fox-proud 176428, fox-alert 173156, fox-run 158398 (ls confirmed). Only the hero uses a 2-entry srcset (fox-620.webp/fox.webp); every decorative and demo image ships one fixed file to all viewports. The 'contradicts the /api/audit product pitch' angle is a valid framing but a business point, not required for the defect. Architectural, medium.

#### `PERF-06` Full-viewport fixed film-grain overlay uses mix-blend-mode: overlay

**LOW** · CONFIRMED-STATIC · paint-compositing · `/home/user/Webfair/src/app/globals.css:72`

- **Reproduction:** sed -n '72,82p' src/app/globals.css.
- **Observed vs expected:** Observed: a fixed, inset:0, z-index:80 SVG-noise pseudo-element with mix-blend-mode:overlay composited over the whole stack. Expected: grain without a global blend (plain low-opacity), or gated off on coarse-pointer/low-end.
- **Verifier note:** Code confirmed exactly as described at globals.css:72-82: body::after position:fixed, inset:0, z-index:80, pointer-events:none, opacity:0.05, mix-blend-mode:overlay, full-viewport data-URI SVG turbulence, background-size 180px. mix-blend-mode does force the compositor to blend this layer against everything beneath, so any underlying repaint re-composites through it. The code fact is certain; the actual paint/composite cost magnitude requires DevTools profiling on a low-end device (dynamic), which I did not run. Kept low.

#### `PERF-07` Many concurrent infinite animations; several animate transform on drop-shadow-filtered nodes

**LOW** · PLAUSIBLE · animation-cost · `/home/user/Webfair/src/components/HeroMedia.tsx:75`

- **Reproduction:** grep -rn 'animate-float' src | grep 'drop-shadow'; sed -n '100,108p' tailwind.config.ts.
- **Observed vs expected:** Observed: numerous always-on infinite animations, and 6 nodes combine a transform animation with a drop-shadow on the same element. Expected: transform-only animation on a node separate from the drop-shadow, and fewer concurrent loops.
- **Verifier note:** The code composition is confirmed: grep 'animate-float' filtered to drop-shadow returns HeroMedia.tsx:75, FinalCTA.tsx:57, HowItWorks.tsx:136, services/page.tsx:48, work/page.tsx:26, pricing/page.tsx:71, each combining animate-float/float-y with drop-shadow on the same <img>. tailwind.config.ts:100-108 plus globals.css:245 confirm the infinite keyframe set. Reduced-motion exemption confirmed (globals.css:119-130). Downgraded to PLAUSIBLE because the stated mechanism ('forces the browser to re-rasterize the filter every frame') is browser-dependent and overstated: modern Chromium can composite a drop-shadow-filtered layer and animate a pure translateY transform cheaply without per-frame re-raster (the shadow output is stable when bounds do not change). Worth noting the desktop HowItWorks (line 112 wrapper) and FinalCTA (line 40 wrapper) foxes already split the animation onto a parent div with drop-shadow on the child, i.e. the recommended pattern, so only the cited mobile/marketing nodes combine them. The 'many concurrent infinite animations run while idle' half is real; the per-frame re-raster claim needs profiling to substantiate. Low.

#### `PERF-08` Fixed navigation bar uses backdrop-blur-xl, repainting the blur on scroll frames

**LOW** · CONFIRMED-STATIC · paint-compositing · `/home/user/Webfair/src/components/Nav.tsx:45`

- **Reproduction:** grep -rn 'backdrop-blur' src | wc -l -> 30; sed -n '45p' src/components/Nav.tsx.
- **Observed vs expected:** Observed: once scrolled, the fixed header applies backdrop-blur-xl; the mobile menu panel also. Expected: a translucent solid or a much smaller blur on the sticky nav.
- **Verifier note:** Confirmed Nav.tsx:45 applies 'bg-[#070312]/70 backdrop-blur-xl' in the scrolled state on the fixed header, and :91 applies backdrop-blur-xl to the mobile menu panel. grep count of backdrop-blur across src = 30. A fixed backdrop-filter re-samples and re-blurs content beneath it on scroll frames, a recognized scroll-jank source on low-end GPUs. The code is confirmed; the jank magnitude is device-dependent and needs Paint Flashing / performance profiling to quantify (dynamic), not run here. One mitigation present: the nav hides on scroll-down (translate-y-full) and only reveals on scroll-up, so it is not blurring during every downward scroll. Low.

#### `PERF-09` DemoShowcase (807-line client component, 5 demos) statically imported into home with no code splitting

**LOW** · CONFIRMED-STATIC · js-hydration · `/home/user/Webfair/src/components/DemoSection.tsx:1`

- **Reproduction:** wc -l src/components/DemoShowcase.tsx -> 807; head -1 -> "use client"; grep -rn 'next/dynamic' src | wc -l -> 0; grep -n 'DemoShowcase' src/components/DemoSection.tsx.
- **Observed vs expected:** Observed: a below-the-fold 807-line client component hydrates on initial home load; no code splitting anywhere. Expected: below-the-fold interactive demos lazy-mounted so hydration defers until near-viewport.
- **Verifier note:** Confirmed the static facts: DemoShowcase.tsx = 807 lines and begins with 'use client' (so it hydrates); DemoSection.tsx:1 statically imports it and page.tsx:8 renders DemoSection in the home tree with MockupModal (page.tsx:15) and AuditPopup (page.tsx:16); grep 'next/dynamic' across src = 0, so nothing is code-split or intersection-gated. The finding itself already concedes the bundle-weight hypothesis is not the issue and reframes the cost as avoidable initial hydration/TBT of below-the-fold client code, which the static evidence supports. The specific build numbers in the reproduction (126 kB First Load, 15.2 kB route chunk) come from npm run build, which I did not run (shared working copy); those figures are NEEDS-DYNAMIC but are not load-bearing for the reframed finding. Low.

#### `PERF-10` LCP hero image on /demos/apex-fence is not prioritized

**LOW** · CONFIRMED-STATIC · image-delivery · `/home/user/Webfair/src/components/FenceSite.tsx:111`

- **Reproduction:** sed -n '109,111p' src/components/FenceSite.tsx; grep -n 'heroImg' src/lib/fence-config.ts; ls -la public/demo/fence/hero.webp.
- **Observed vs expected:** Observed: the full-bleed hero image is fetched at default priority with no preload. Expected: fetchPriority="high" (and/or a preload) on the confirmed LCP image.
- **Verifier note:** Confirmed FenceSite.tsx:111 renders the full-bleed hero as <img src={c.heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" ...> with no fetchPriority, no loading hint, and no preload (grep preload across src = 0). c.heroImg resolves to '/demo/fence/hero.webp' (fence-config.ts:30), which ls confirms at 151664 bytes. A full-bleed absolute inset-0 object-cover image is the plausible LCP element for that route, so shipping it at default priority behind other subresources is a real (if modest) LCP miss. The LCP-element identity would be nailed by a field trace but the full-bleed positioning makes it defensible. Low.

#### `PERF-11` CustomCursor runs a DOM closest() traversal on every pointermove, globally on all routes

**LOW** · CONFIRMED-STATIC · input-latency · `/home/user/Webfair/src/components/CustomCursor.tsx:46`

- **Reproduction:** sed -n '43,48p' src/components/CustomCursor.tsx; grep -n 'CustomCursor' src/app/layout.tsx.
- **Observed vs expected:** Observed: closest() ancestor-walk runs per pointermove on every route (including CRM/tools); only the visual lerp is rAF-throttled. Expected: hit-test computed once per frame inside the rAF loop, or the cursor scoped to marketing routes.
- **Verifier note:** Confirmed CustomCursor.tsx:43-48 onMove calls el?.closest("a,button,input,textarea,select,label,[role=slider],[data-cursor]") synchronously on each pointermove; the rAF loop (lines 29-40) throttles only the transform/opacity writes, not the closest() call which lives in the event handler. layout.tsx:51 mounts <CustomCursor /> at the root for all routes. Verified the touch/reduced-motion short-circuit is genuine: the effect returns early (lines 15-21) before addEventListener, so on coarse-pointer or reduced-motion no pointermove listener is attached (setOn(false), component returns null), meaning only fine-pointer users pay the cost. The per-event ancestor walk is real; its INP contribution depends on DOM depth and is small per call, so the magnitude needs a field/INP measurement, but the pattern is confirmed. Low.

---

### 9. SEO & AI Answer Engines (AIO)

_15 findings: 0 critical, 0 high, 6 medium, 9 low._

#### `SEO-01` Canonical footgun: /privacy and /terms self-canonicalize to the homepage

**MEDIUM** · CONFIRMED-STATIC · seo · `src/app/layout.tsx:37`

- **Reproduction:** Static source verification (build/server prohibited by task rules, but Next.js metadata alternates inheritance is deterministic and documented). layout.tsx:37 sets alternates.canonical='https://stackwrk.com'. privacy/page.tsx:4-7 and terms/page.tsx:4-7 export metadata with only title+description and NO alternates, so Next.js inherits the parent segment's alternates. No mockup/demos/privacy/terms layout.tsx overrides it (find returned none).
- **Observed vs expected:** Observed: /privacy and /terms inherit rel=canonical https://stackwrk.com. Expected: each canonicals to its own URL.
- **Fix direction:** Give privacy/terms their own alternates.canonical, or drop the global absolute canonical so pages self-canonicalize.
- **Verifier note:** Confirmed at source: root layout sets an absolute homepage canonical; privacy and terms set no alternates, so they inherit it. Next.js metadata inheritance (child that omits `alternates` keeps the parent's) is deterministic, so no running server is needed to establish the outcome. Downgraded high->medium: I verified work/services/pricing/contact each set their OWN self-referential canonical (work:13, services:17, pricing:18, contact:14), so the money pages are safe. The footgun's real blast radius is only the low-value pages (privacy, terms, mockup, and the noindex demos tree). Real defect, limited harm.

#### `SEO-02` /mockup renders indexable with no noindex, unlike every sibling internal route

**MEDIUM** · CONFIRMED-STATIC · indexation · `src/app/mockup/page.tsx:1`

- **Reproduction:** mockup/page.tsx:1 is 'use client', so it cannot export metadata, and there is no mockup/layout.tsx (find returned none). Sibling private routes all carry robots index:false,follow:false: mockup/preview:12, crm:6, prospects:13, quote:6, agreement:8. So /mockup alone inherits layout.tsx:36 index:true + layout.tsx:37 homepage canonical.
- **Observed vs expected:** Observed: /mockup inherits robots index,follow + homepage canonical. Expected: noindex,nofollow like its sibling private routes.
- **Fix direction:** Add a server wrapper that exports robots noindex for /mockup, matching /mockup/preview.
- **Verifier note:** Confirmed at source. Verified head -1 of mockup/page.tsx is 'use client' and grep of robots overrides shows every other internal route has noindex while /mockup has none, with no layout override. Its only protection is robots.txt Disallow /mockup (robots.ts:8), and a disallow cannot deindex. Real defect; kept medium since the page is behind private use and disallowed, limiting exposure.

#### `SEO-03` No og:image / twitter:image anywhere despite summary_large_image card

**MEDIUM** · CONFIRMED-STATIC · social-aio · `src/app/layout.tsx:32`

- **Reproduction:** grep -rn openGraph src | grep image -> none. find for opengraph-image* -> none (only icon.png/apple-icon.png). twitter card summary_large_image declared at layout.tsx:32 and again at guides/[slug]/page.tsx:42, with no images set on any route.
- **Observed vs expected:** Observed: zero og:image/twitter:image sitewide while twitter.card=summary_large_image. Expected: a default OG image backing the card.
- **Fix direction:** Add an opengraph-image.tsx (or static /public OG image via openGraph.images) at the layout level.
- **Verifier note:** Confirmed at source. No openGraph.images key anywhere in src, no opengraph-image.(tsx|png) file exists, yet summary_large_image is promised in two places. Large-image social cards will render blank. Static facts fully verified; no server needed.

#### `SEO-04` Meta descriptions exceed the ~160-char SERP limit across guides, hubs, and tools

**MEDIUM** · CONFIRMED · seo · `src/lib/guides.ts:116`

- **Reproduction:** Ran node --experimental-strip-types over the real GUIDES and freeTools arrays (scratchpad/seo_measure.mts). Result: 15/15 guide descriptions over 160 (min 180, max 227); guides hub 204; tools hub 163; website-audit metaDesc 170; saas-vs-custom 200. (roi-calculator is 158, under, matching the finding's 'two tool metaDescriptions over' claim.)
- **Observed vs expected:** Observed: descriptions 163-227 chars. Expected: <= ~155-160 chars.
- **Fix direction:** Trim each description to <=160 chars, leading with the answer.
- **Verifier note:** CONFIRMED by executing the repo's actual data through Node, not by eyeballing. Every number in the finding reproduced exactly (guides 180-227, hub 204/163, audit 170, saas 200). Correctly excludes roi (158). Genuine but cosmetic/CTR-level, so medium is appropriate.

#### `SEO-06` No in-body contextual internal links in guides, and zero guide<->tool cross-links

**MEDIUM** · CONFIRMED-STATIC · internal-linking · `src/lib/guides.ts:17`

- **Reproduction:** GuideBlock union (guides.ts:17-25) has no link/anchor variant. Block renderer (guides/[slug]/page.tsx:62-159) has a case per type; none emits <a>/<Link>. grep '/tools' src/lib/guides.ts -> none; grep '/guides' src/lib/tools.ts src/components/ToolLayout.tsx -> none. guides.ts:273 references 'the SaaS vs custom calculator' as plain type:'p' text.
- **Observed vs expected:** Observed: in-prose guide/tool mentions render as plain <p> text; no guide->tool or tool->guide links. Expected: contextual <Link>s between related guides and calculators.
- **Fix direction:** Add a link/anchor GuideBlock variant and wire guide prose to sibling guides and /tools.
- **Verifier note:** Confirmed at source. The block schema literally has no anchor variant and the renderer has no anchor branch, so in-prose links are structurally impossible without a schema change. Verified guides.ts:273 is the exact plain-text calculator mention cited. Only internal links are the related-cards footer and global Nav. Real cluster-linking gap.

#### `SEO-07` Commercial marketing pages emit zero structured data

**MEDIUM** · CONFIRMED-STATIC · structured-data · `src/app/services/page.tsx:13`

- **Reproduction:** grep -c 'JsonLd|application/ld' on each of work/services/pricing/contact page.tsx -> 0 0 0 0. Contrast: page.tsx:24 ProfessionalService + :46 WebSite; ToolLayout.tsx:29 WebApplication + :40 FAQPage + :49 BreadcrumbList.
- **Observed vs expected:** Observed: 0 JSON-LD on /work, /services, /pricing, /contact. Expected: at least BreadcrumbList site-wide plus Service/Offer on /services and /pricing.
- **Fix direction:** Add BreadcrumbList site-wide and Service/OfferCatalog on /services and /pricing (ContactPoint on /contact) via the existing JsonLd component.
- **Verifier note:** Confirmed at source. The four commercial pages import no JsonLd and emit no ld+json, while the homepage and tool pages do. No site-wide BreadcrumbList exists. Accurate; these are the conversion pages most helped by entity markup.

#### `SEO-05` Title tags exceed ~60 chars on 12/15 guides and all 3 tools

**LOW** · CONFIRMED · seo · `src/app/guides/[slug]/page.tsx:32`

- **Reproduction:** generateMetadata appends ' | Stackwrk' (guides/[slug]/page.tsx:29,32). Ran seo_measure.mts computing (metaTitle ?? title).length + suffix: 12/15 guides over 60, max 72 ('Outgrew Jobber or Housecall Pro? Your Options When It's Rigid | Stackwrk'). Tool metaTitle lengths: website-audit 64, roi 62, saas 68.
- **Observed vs expected:** Observed: 12/15 guide titles >60 (max 72) plus 3 tools 64/62/68. Expected: <= ~60 chars including the ' | Stackwrk' suffix.
- **Fix direction:** Shorten metaTitle values (or the suffix) so assembled titles stay <=60.
- **Verifier note:** CONFIRMED by running the real data. Exact counts (12/15, max 72, tools 64/62/68) reproduced. Correct cosmetic SEO nit; low severity is right.

#### `SEO-08` Article JSON-LD omits the recommended image field on every guide

**LOW** · CONFIRMED-STATIC · structured-data · `src/app/guides/[slug]/page.tsx:173`

- **Reproduction:** articleLd object (guides/[slug]/page.tsx:173-187) contains headline, description, datePublished, dateModified, mainEntityOfPage, author, publisher only, no image. Guide type (guides.ts:31-50) has no image field, so it cannot be populated without a schema change.
- **Observed vs expected:** Observed: articleLd has no image key. Expected: an image URL per Google's Article guidance.
- **Fix direction:** Add an image field to the Guide type and include it in articleLd (a per-guide OG image satisfies both this and SEO-03).
- **Verifier note:** Confirmed at source: read both the articleLd literal and the Guide type; neither has an image field. Google lists Article image as recommended (not required), so this is a genuine but low-severity rich-result eligibility gap. The Rich Results warning claim is a documented Google behavior, not independently run.

#### `SEO-09` BreadcrumbList structured 3rd item does not match the visible breadcrumb

**LOW** · CONFIRMED-STATIC · structured-data · `src/app/guides/[slug]/page.tsx:205`

- **Reproduction:** breadcrumbLd.itemListElement[2].name = g.title (guides/[slug]/page.tsx:205). Visible breadcrumb nav third span = {cluster?.name ?? 'Guide'} (line 224). The two differ: structured emits Home/Guides/<article title>, visible shows Home/Guides/<cluster name>.
- **Observed vs expected:** Observed: structured 3rd crumb = g.title (full article title); visible 3rd crumb = cluster?.name. Expected: identical text.
- **Fix direction:** Make the JSON-LD 3rd item and the visible crumb use the same value.
- **Verifier note:** Confirmed at source by reading both lines. Real mismatch between JSON-LD breadcrumb and the rendered trail, which Google's breadcrumb guidance says should match. Low severity (validation warning, not an error).

#### `SEO-10` /privacy and /terms are indexable but missing from the sitemap

**LOW** · CONFIRMED-STATIC · sitemap · `src/app/sitemap.ts:11`

- **Reproduction:** sitemap.ts (lines 11-31) enumerates /, /work, /services, /pricing, /guides, /contact, /tools, 3 tool slugs, 15 guide slugs. No privacy/terms entry. Both pages set no robots override, so they inherit layout.tsx:36 index:true,follow:true.
- **Observed vs expected:** Observed: /privacy and /terms absent from sitemap yet indexable. Expected: both listed.
- **Fix direction:** Add /privacy and /terms to sitemap.ts (after fixing their canonicals per SEO-01).
- **Verifier note:** Confirmed at source: read the full sitemap array (no privacy/terms) and confirmed both legal pages omit any robots override, so they are indexable. Accurate discoverability gap, low severity.

#### `SEO-11` Uniform publish dates and build-time lastModified weaken freshness signals

**LOW** · CONFIRMED · freshness · `src/lib/guides.ts:121`

- **Reproduction:** Ran seo_measure.mts over GUIDES: distinct date = ['2026-07-16'], distinct updated = ['2026-07-16'], date===updated on 15/15. sitemap.ts:9 sets const lastModified = new Date() applied to all static routes.
- **Observed vs expected:** Observed: every guide date===updated==='2026-07-16'; static-route sitemap lastModified = build time. Expected: staggered real dates and a pinned static lastModified.
- **Fix direction:** Set genuine staggered date/updated per guide and pin static-route lastModified to a stable value.
- **Verifier note:** CONFIRMED by executing the data (all 15 identical) plus reading sitemap.ts:9. Both halves hold: the whole cluster shares one date, and static-route lastModified resets to deploy time each build. Minor E-E-A-T/freshness signal, low severity.

#### `SEO-12` Structured author is a faceless Organization while the byline claims a named human

**LOW** · CONFIRMED-STATIC · eeat · `src/app/guides/[slug]/page.tsx:181`

- **Reproduction:** articleLd.author = {'@type':'Organization', name:'Stackwrk'} (guides/[slug]/page.tsx:181). Visible byline (line 304): 'Written by Tal, founder of Stackwrk. I build custom software...'. Mismatch between schema author type and the claimed human expert.
- **Observed vs expected:** Observed: articleLd.author @type Organization 'Stackwrk'; visible byline names a person (Tal). Expected: a Person author modeled in schema.
- **Fix direction:** Model author as @type Person (Tal, worksFor Stackwrk) to match the byline.
- **Verifier note:** Confirmed at source: read both the author literal and the byline paragraph. The named human is not machine-readable. Legitimate E-E-A-T modeling gap, low severity.

#### `SEO-13` ProfessionalService sameAs points to placeholder root domains, not real profiles

**LOW** · CONFIRMED-STATIC · structured-data · `src/lib/content.ts:14`

- **Reproduction:** content.ts:13-15 socials.linkedin='https://www.linkedin.com/', github='https://github.com/'. page.tsx:42 sets sameAs:[site.socials.linkedin, site.socials.github].filter(Boolean). Both are non-empty so .filter(Boolean) keeps them, emitting the two root domains into the homepage ProfessionalService schema.
- **Observed vs expected:** Observed: sameAs = ['https://www.linkedin.com/','https://github.com/'] (bare root domains). Expected: real profile URLs, or omit sameAs.
- **Fix direction:** Replace the placeholder socials with real profile URLs, or drop sameAs until real ones exist.
- **Verifier note:** Confirmed at source by reading content.ts:13-15 and page.tsx:42. The bare root domains flow straight into sameAs and survive the Boolean filter. Invalid entity references that weaken the sameAs signal. Low severity.

#### `SEO-14` Guide readMins overstate actual length by roughly 1.3-1.5x

**LOW** · CONFIRMED · content-accuracy · `src/lib/guides.ts:120`

- **Reproduction:** Ran the repo's own guideWordCount() (guides.ts:1980) over all 15 guides via seo_measure.mts: words 801-1567, avg 1052; implied minutes at 225 wpm 3.6-7.0 while stated readMins are 5-7. Thinnest (801 words, automate-recurring-service-rebooking-reminders) labeled 5 min reads in ~3.6.
- **Observed vs expected:** Observed: stated readMins 5-7 vs ~3.6-7.0 min actual at 225 wpm. Expected: readMins derived from guideWordCount.
- **Fix direction:** Compute readMins from guideWordCount (words/225, rounded) instead of hardcoding.
- **Verifier note:** CONFIRMED by running the repo's own word-counter. Direction and magnitude hold: readMins is systematically optimistic (~1.3-1.5x). Minor caveat on the finding's headline: the average overstatement is closer to 1.35x than a flat 1.5x (e.g. 6min/4.4 = 1.36x), and the thinnest guide is ~3.6min not ~4. The underlying defect is real; I adjusted the title to '1.3-1.5x'. Low severity.

#### `SEO-15` Noindex /demos/apex-fence tree is crawlable and inherits the homepage canonical

**LOW** · CONFIRMED-STATIC · crawl-budget · `src/app/robots.ts:8`

- **Reproduction:** robots.ts:8 disallow = ['/crm','/quote','/prospects','/mockup','/agreement'], no /demos. All demo pages export robots index:false,follow:false (apex-fence/page.tsx:14, guides/page.tsx:13, guides/[slug]/page.tsx:20, areas/[city]/page.tsx:22, tools/page.tsx:17) but none sets alternates.canonical and there is no demos/layout.tsx, so they inherit layout.tsx:37 homepage canonical.
- **Observed vs expected:** Observed: /demos tree crawlable (not in robots Disallow), pages noindex, canonical inherited from homepage. Expected: Disallow /demos to save crawl budget.
- **Fix direction:** Add /demos to the robots.txt Disallow list.
- **Verifier note:** Confirmed at source: read robots.ts (no /demos), confirmed every demo page is noindex, and confirmed none sets a canonical with no demos layout override, so the homepage-canonical footgun (SEO-01) applies (moot while noindex). The crawl-budget waste is real but minor for a small demo tree. Low severity.

---

### 10. Accessibility (WCAG 2.2 AA)

_14 findings: 0 critical, 5 high, 8 medium, 1 low._

#### `A11Y-01` Low-opacity white text fails WCAG 1.4.3 contrast site-wide (2.53:1 to 4.44:1)

**HIGH** · CONFIRMED-STATIC · contrast · `src/components/AuditForm.tsx:119`

- **Reproduction:** grep counts: text-white/30 = 3, text-white/{35,40,45} = 69. Node luminance script over body #070312.
- **Observed vs expected:** Normal body/meta text at 2.53 to 4.44:1 over #070312; SC 1.4.3 requires >= 4.5:1 for normal text.
- **Fix direction:** Raise normal-size tokens to at least white/55 (6.27:1); reserve white/40 to /45 for genuinely large/bold text.
- **Verifier note:** CONFIRMED. Re-ran the exact WCAG-compositing script: white/30=2.53, /35=3.07, /40=3.72, /45=4.44, /55=6.27, /60=7.32, /65=8.53, matching the candidate byte-for-byte. Grep counts reproduced exactly (3 uses of /30, 69 of /35+/40+/45). Cited nodes verified to be real normal-size, normal-weight text, not exempt: AuditForm.tsx:119 text-xs 'No spam' (/35, 3.07), AuditPopup.tsx:163 text-[0.7rem] 'No spam. Unsubscribe' (/35), pricing/page.tsx:117 white/40 strike-through old price (meaningful), :140 white/45 guarantee disclaimer, Footer.tsx:17 white/40 copyright and :29 tagline, guides/[slug]/page.tsx:219 white/40 breadcrumb and :231 white/45 meta. Static/deterministic math, no server needed. High retained: pervasive and sits on the audit/mockup/pricing conversion paths.

#### `A11Y-02` Entry AuditPopup dialog has no Escape, focus trap, initial focus, focus restore, or scroll lock

**HIGH** · CONFIRMED-STATIC · modal-focus · `src/components/AuditPopup.tsx:94`

- **Reproduction:** Read AuditPopup.tsx; grep for Escape/keydown/overflow/activeElement/.focus(.
- **Observed vs expected:** role=dialog aria-modal container with no keyboard/focus/scroll management; expected Escape close, focus trap, initial focus, restore, body scroll lock.
- **Fix direction:** Add Escape handler, focus trap with initial focus and restore, and body scroll lock (mirror MockupModal).
- **Verifier note:** CONFIRMED. Read the full file: container at 94-100 sets role=dialog, aria-modal=true, aria-label. grep for Escape/keydown returns nothing; no window keydown listener exists so close() can never fire on Escape. No document.body.style.overflow is ever set (the only 'overflow' hit is a Tailwind overflow-hidden class on the card at line 104, unrelated to scroll lock). dialogRef (line 28) is used solely for onClick stopPropagation, never focused; no .focus() or activeElement anywhere. The only effects are the 2.5s open timer (30-40) and close() (42-46). Contrast with MockupModal which does handle Escape (25) and scroll lock (27-28). Static evidence is conclusive; the escape-to-page and no-scroll-lock behaviors are inherent to the missing code. High retained: entry popup on the primary funnel.

#### `A11Y-03` Placeholder-only form fields with no label on the popup and CRM access-key input

**HIGH** · CONFIRMED-STATIC · form-labels · `src/components/AuditPopup.tsx:144`

- **Reproduction:** Read AuditPopup.tsx:144-146 and CrmBoard.tsx:81-87.
- **Observed vs expected:** Inputs expose no accessible name (placeholder only); expected sr-only label, aria-label, or wrapping label.
- **Fix direction:** Add sr-only label or aria-label to the three popup inputs and the CRM access-key input, matching AuditForm's sr-only pattern.
- **Verifier note:** CONFIRMED. AuditPopup.tsx:144-146 are three bare <input> elements (url, name, email) with only placeholder, no <label> wrapper, no htmlFor/id, no aria-label/aria-labelledby. The adjacent consent checkbox (148-149) IS properly wrapped in a label, so only the three text inputs are unnamed. CrmBoard.tsx:81-87 is a type=password input with placeholder 'Access key' and no associated label. Directly contrasts with AuditForm.tsx:84,88,94,99 which use sr-only <span> labels. Placeholder-only is a well-established 1.3.1/3.3.2/4.1.2 failure. Secondary placeholder-contrast claim also checks out: placeholder-white/35 over the near-black field composites to about 3.1:1 (my script gave 3.14 over card bg). Static and conclusive.

#### `A11Y-04` Fence demo range sliders have no accessible name (labels not associated with inputs)

**HIGH** · CONFIRMED-STATIC · form-labels · `src/components/FenceEstimator.tsx:72`

- **Reproduction:** Read FenceEstimator/MaterialsCalculator/FinancingCalculator/StainCalculator; confirm sibling <label> with no htmlFor and range with no id; compare RoiCalculator/SaasVsCustom nesting.
- **Observed vs expected:** Native range sliders announce with no name; expected wrapping label, htmlFor+id, or aria-label.
- **Fix direction:** Nest each range input inside its <label> (as RoiCalculator/SaasVsCustom do) or add matching htmlFor/id or aria-label.
- **Verifier note:** CONFIRMED. Verified all four: FenceEstimator.tsx label at 72 / range at 75-79, MaterialsCalculator.tsx label 34 / range 37, FinancingCalculator.tsx label 24 / range 27, StainCalculator.tsx label 26 / range 29. In every case the <label> is a sibling with no htmlFor, and the <input type=range> has no id, no aria-label, and is not nested, so no programmatic name is exposed. Confirmed the stated 'inverse': RoiCalculator.tsx:27-49 and SaasVsCustomCalculator.tsx:59-98 both nest the range input inside the <label>, which is correct. Static and conclusive. High retained: these are public lead-magnet tools.

#### `A11Y-05` Nav mobile menu keeps links focusable while visually collapsed; toggle lacks aria-controls

**HIGH** · CONFIRMED-STATIC · keyboard · `src/components/Nav.tsx:90`

- **Reproduction:** Read Nav.tsx:90-93 (menu container) and 74-79 (toggle).
- **Observed vs expected:** Collapsed menu uses overflow-hidden + max-h-0 (not display:none/hidden/inert) so links stay in tab order; toggle has aria-expanded but no aria-controls.
- **Fix direction:** Gate the collapsed menu with hidden/inert or conditional render, and add id + aria-controls linking the toggle to the menu.
- **Verifier note:** CONFIRMED. Menu container (90-93) collapses via 'overflow-hidden ... transition-[max-height] ... max-h-0' when closed, plus md:hidden. Since overflow:hidden with max-height:0 does not remove elements from the tab order (only display:none / visibility:hidden / [hidden] / inert do), the links and mockup CTA (96-109) remain focusable on a narrow viewport while the menu is closed. Toggle button (74-79) sets aria-expanded={open} but has no aria-controls attribute. Both facts are directly readable from source and hold statically. On desktop the md:hidden is display:none so no issue there; the defect is real on <768px. High retained per plan, though it is a mobile-keyboard case.

#### `A11Y-06` Global focus-visible ring is defeated by outline-none; several inputs signal focus by border color only

**MEDIUM** · CONFIRMED-STATIC · focus-visible · `src/app/globals.css:145`

- **Reproduction:** globals.css:91-95 base :focus-visible; outline-none present on crm-input (145), mockup field (mockup/page.tsx:13), CrmBoard key input (CrmBoard.tsx:86).
- **Observed vs expected:** Base :focus-visible 2px lime outline is overridden by the outline-none utility (later @layer wins); crm-input, /mockup field, and CRM key input then change only a 1px border color on focus.
- **Fix direction:** Drop outline-none on these controls or re-assert a focus-visible outline/ring in the utilities layer.
- **Verifier note:** CONFIRMED (mechanism) with a caveat on the 2.4.7 conclusion. The cascade claim is correct: globals.css:91-95 defines :focus-visible { outline: 2px solid lime } in @layer base; Tailwind's outline-none resolves to 'outline: 2px solid transparent' in @layer utilities. CSS @layer ordering makes utilities beat base regardless of the equal (0,1,0) specificity, so on any element carrying outline-none the transparent outline wins and the lime ring never renders. Verified the three flagged controls have outline-none and only a focus:border color change with no ring: crm-input (globals.css:145, focus:border-emerald-500 / dark:focus:border-lime/50), mockup/page.tsx:13 (focus:border-lime/50), CrmBoard.tsx:86 (focus:border-lime/60). Caveat: marketing 'field' inputs (AuditForm.tsx:68 etc.) add focus:ring-2 focus:ring-lime/20, a box-shadow ring that survives outline-none, so they still show a (faint) indicator; the candidate scopes the no-ring claim correctly to the CRM/mockup controls. A border-color change is technically a 'visible' focus indicator, so the strict 2.4.7 AA failure is borderline, but the intended global ring is genuinely defeated. Medium retained.

#### `A11Y-07` CRM Board drawer and modals are non-semantic overlays with no Escape, focus trap, or named close control

**MEDIUM** · CONFIRMED-STATIC · modal-focus · `src/app/prospects/Board.tsx:560`

- **Reproduction:** Read Board.tsx; grep Escape/keydown/role=dialog/aria-modal.
- **Observed vs expected:** Drawer (560), import (759), add-lead (774) are plain fixed inset-0 divs closing via backdrop onClick only; no role=dialog/aria-modal, no Escape, no focus trap; drawer close is an unlabeled glyph button.
- **Fix direction:** Wrap each overlay as role=dialog aria-modal with Escape handling and a focus trap, and give the glyph close button aria-label='Close'.
- **Verifier note:** CONFIRMED. grep across Board.tsx for Escape, keydown, role="dialog", aria-modal, role="status", aria-live returns zero matches. Detail drawer (556-561) and import (759) / add-lead (774) overlays are plain fixed divs that close only via backdrop onClick or a text Cancel button. Drawer close control at line 567 is <button onClick={closeDrawer}>x</button> with no aria-label, announced only as the glyph. The import/add Cancel buttons do carry text so they are named, but the surfaces still lack dialog semantics, Escape, and focus trapping. Static and conclusive. Medium retained: /prospects is a gated, noindex internal tool.

#### `A11Y-08` Async status and loading changes are not announced to screen readers

**MEDIUM** · CONFIRMED-STATIC · live-region · `src/app/prospects/Board.tsx:806`

- **Reproduction:** grep aria-live/role=status/role=alert across src/**/*.tsx.
- **Observed vs expected:** Toasts, loading spinner, email-hunt progress, and form success states change silently; expected role=status/aria-live=polite.
- **Fix direction:** Wrap the toast, loading spinner, email-hunt progress, and form success states in role=status aria-live=polite.
- **Verifier note:** CONFIRMED. Site-wide grep returns exactly 4 role=alert nodes (DemoShowcase.tsx:144, AuditTool.tsx:319, :393, AuditForm.tsx:109) and zero aria-live and zero role=status anywhere. Board.tsx:806 toast is a plain fixed div. CrmBoard.tsx:97-104 'Loading pipeline' spinner and Board.tsx:440 email-hunt progress button are not live regions. AuditForm success card (53-64) replaces the form with no announcement, while only its error <p> (109) has role=alert. All directly evidenced in source. Static and conclusive. Medium retained.

#### `A11Y-09` MockupModal does not trap focus, set initial focus, or restore focus on close

**MEDIUM** · CONFIRMED-STATIC · modal-focus · `src/components/MockupModal.tsx:42`

- **Reproduction:** Read MockupModal.tsx; confirm no focus-management code.
- **Observed vs expected:** Focus can leave the dialog and is lost to body on close; expected focus trapped, placed at open, restored to trigger at close.
- **Fix direction:** Add initial focus into the dialog, a focus trap while open, and focus restore to the invoking #mockup CTA on close.
- **Verifier note:** CONFIRMED. Read the full file. It correctly handles Escape (25) and body scroll lock (27-28), but contains no .focus() call, no ref, no activeElement capture/restore, and no focus-trap logic. Nothing places focus into the dialog at open or returns it to the triggering CTA at close, so Tab escapes into background content and focus falls to document.body after close. Static and conclusive. Medium retained per plan.

#### `A11Y-10` CRM crm-subtle token and crm-input placeholders fail contrast in both light and dark

**MEDIUM** · CONFIRMED-STATIC · contrast · `src/app/globals.css:148`

- **Reproduction:** Node contrast: slate-400 on slate-100/white, slate-500 on #0b0f14.
- **Observed vs expected:** crm-subtle 2.34 to 4.04:1 and placeholders 2.56 to 4.04:1; SC 1.4.3 requires >= 4.5:1 for these normal-size texts.
- **Fix direction:** Darken crm-subtle in light (slate-500/600) and lighten in dark (slate-400); same for input placeholders.
- **Verifier note:** CONFIRMED. globals.css:148 crm-subtle = text-slate-400 dark:text-slate-500; :145 crm-input placeholder = slate-400 light / slate-500 dark. Re-ran the script: slate-400 (#94a3b8) on slate-100 = 2.34, on white = 2.56; slate-500 (#64748b) on #0b0f14 = 4.04, all below 4.5, so crm-subtle and the placeholders fail in both themes, matching the candidate exactly. Usages confirmed in Board.tsx (e.g. 518 count, 545 empty '-' marker, 600/646/683 labels). Note the sibling crm-muted token fails only in light (slate-500 on slate-100 = 4.34) and passes in dark (slate-400 on #0b0f14 = 7.50), which is why the candidate scoped this to crm-subtle plus placeholders. Static math. Medium retained; internal noindex tool.

#### `A11Y-11` JS-driven motion ignores prefers-reduced-motion (audit count-up, activity ticker)

**MEDIUM** · CONFIRMED-STATIC · reduced-motion · `src/components/AuditTool.tsx:49`

- **Reproduction:** Read AuditTool.tsx:49-62 (rAF, no guard), FenceTicker.tsx:23-29 (setInterval, no guard), compare CountUp.tsx:32, Reveal.tsx:32, ScrollParallax.tsx:23.
- **Observed vs expected:** rAF count-up and setInterval ticker keep animating under reduced-motion; expected they render the final/static state when reduce is set, matching CountUp/Reveal/ScrollParallax.
- **Fix direction:** Guard ScoreRing and FenceTicker (and SampleScorecard) with matchMedia('(prefers-reduced-motion: reduce)') and render the final state when set.
- **Verifier note:** CONFIRMED. AuditTool.tsx ScoreRing (49-62) drives its count-up with requestAnimationFrame + setShown React state and has no reduced-motion check. FenceTicker.tsx (23-29) cycles text every 3400ms via setInterval + setI/setShow with no matchMedia guard. Crucially, the global reduced-motion rule (globals.css:119-130) only caps CSS animation-duration/transition-duration, so it does not touch rAF-driven or setInterval-driven state changes, confirming the motion keeps running. Verified the cited counter-examples DO guard: CountUp.tsx:32 and Reveal.tsx:32 bail on matchMedia reduce, and ScrollParallax.tsx:23 returns early on reduce, making the ScoreRing/FenceTicker omission a clear in-repo inconsistency. Static and conclusive. Medium retained (count-up is minor; ticker is a >5s auto-update).

#### `A11Y-12` Input and card borders fall below the 3:1 non-text contrast minimum

**MEDIUM** · CONFIRMED-STATIC · contrast · `src/app/globals.css:209`

- **Reproduction:** Node contrast over #070312: white/0.08=1.16, /0.10=1.22, /0.12=1.30.
- **Observed vs expected:** card/input borders 1.16 to 1.30:1 vs the adjacent near-black background; SC 1.4.11 wants >= 3:1 for component boundaries.
- **Fix direction:** Increase border opacity/lightness (or add fill contrast) so input/card edges reach >= 3:1 against the page.
- **Verifier note:** CONFIRMED math, with a note that 1.4.11 applicability to input borders is somewhat interpretive. Re-ran the script over body #070312: white/[0.08]=1.16, white/10=1.22, white/12=1.30, all well under 3.0, matching the candidate. Borders verified in source: card '.card' border-white/[0.08] (globals.css:209); AuditForm field border-white/10 (68); border-white/12 on AuditPopup (12), AuditTool (271), QuoteBuilder (111); CrmBoard key input border-white/12 (86). The input fill (bg-ink-800/70, ink-800 #0F0A1F composited over #070312 lands near [13,8,28]) is nearly identical to the page, so the sub-3:1 border is effectively the sole boundary indicator, which is the SC 1.4.11 concern. Static and deterministic. Medium retained; the strict 1.4.11 pass/fail on input edges is defensible but debatable.

#### `A11Y-13` Fixed hide-on-scroll nav and sticky bars can obscure keyboard focus (SC 2.4.11)

**MEDIUM** · NEEDS-DYNAMIC-VERIFICATION · focus-obscured · `src/components/Nav.tsx:40`

- **Reproduction:** Read Nav.tsx:28-30 (reveal logic), 40-48 (fixed header). Runtime shift-Tab up a long page to observe coverage.
- **Observed vs expected:** A focused control can be covered by the re-revealed fixed header when shift-Tabbing upward; SC 2.4.11 requires the focused element stay at least partially visible.
- **Fix direction:** Add scroll-margin-top equal to header height to focusable elements, or keep the header revealed while an adjacent control has focus.
- **Verifier note:** PLAUSIBLE but cannot be proven statically. The static preconditions all hold: header is position:fixed top-0 (Nav.tsx:40-41), it re-reveals to translate-y-0 on any scroll-up (28-30, 42), StickyCTA is fixed bottom on mobile, and scroll-padding-top:68px (globals.css:37) only offsets anchor jumps, not Tab focus. Whether the revealed ~56px header actually ENTIRELY covers a given focused control (SC 2.4.11 permits partial obscuring) depends on runtime scroll-into-view placement and timing, which needs a real keyboard/browser session to confirm and the instructions forbid starting a server. Marked NEEDS-DYNAMIC-VERIFICATION. Severity held at medium pending that check.

#### `A11Y-14` Auto-scrolling marquees run indefinitely with only a hover pause

**LOW** · CONFIRMED-STATIC · moving-content · `src/components/Hero.tsx:157`

- **Reproduction:** Read Hero.tsx:157 (hover:[animation-play-state:paused]) and DemoShowcase.tsx:551 (no pause hook); tailwind.config.ts:106 marquee 26s linear infinite.
- **Observed vs expected:** Hero logo marquee pauses on mouse hover only; DemoShowcase marquee has no pause at all; SC 2.2.2 wants a keyboard/touch-operable pause/stop/hide for >5s motion.
- **Fix direction:** Provide a real pause control (or pause on reduced-motion or focus-within) for both marquees, not just hover-pause.
- **Verifier note:** CONFIRMED. Hero.tsx:157 ul has 'animate-marquee ... hover:[animation-play-state:paused]', a mouse-hover-only pause with no keyboard/touch affordance and no visible pause button. DemoShowcase.tsx:551 marquee is 'w-max animate-marquee whitespace-nowrap' with no pause hook whatsoever. tailwind.config.ts:106 confirms marquee runs 26s linear infinite (>5s). The global reduced-motion CSS cap does freeze both (they are CSS animations), which the candidate correctly notes as partial mitigation that does not satisfy 2.2.2 for users who have not set that preference. Note the DemoShowcase marquee is intentional parody of a bad 2003 site, but SC 2.2.2 still applies. Static and conclusive. Low retained.

---

### 11. Code Quality & Maintainability

_16 findings: 0 critical, 2 high, 9 medium, 5 low._

#### `CODE-02` Zero automated tests cover high-risk pure logic that handles money, auth, PII, and SSRF

**HIGH** · CONFIRMED-STATIC · test-gap · `package.json:5`

No test script, no *.test.*/*.spec.* files, no vitest/jest/playwright config. The untested pure functions are the ones easiest to get subtly wrong: SSRF guards, HMAC session signing, webhook signature verification, CSV dedup, and audit scoring.

- **Reproduction:** find src for *.test.*/*.spec.* returns empty; package.json has no "test" script; no vitest.config/jest.config/playwright.config anywhere; playwright is a devDependency with no specs.
- **Observed vs expected:** Observed: no runner, no tests. Expected: a minimal suite over the enumerated pure functions.
- **Fix direction:** Add Vitest and unit-test the enumerated helpers, starting with SSRF, token, and dedup logic.
- **Verifier note:** Confirmed: no test files, no "test" script, no runner config, playwright an unused devDep. Confirmed every enumerated function exists and is pure/testable: phoneCheck/phoneDigits (prospects.ts:83,90), parseCSV/rowsToProspects (Board.tsx:16,30), makeToken/verifyToken (crm-auth.ts:26,31), verifyQuoWebhook+verifyLegacy/verifyStandard (quo.ts:129,109,118), reportFromEmail (email.ts:26), isPrivateIp/isBlockedHost/normalizeUrl (safe-fetch.ts:14,35,56), scoreOf and the weighted score/caps (audit/route.ts:23,314-323). Kept high: a risk/process gap not an active bug, but the specific untested surface (SSRF, HMAC session signing, webhook sig verify, money) is exactly the code that fails silently, and it ships to prod with no lint gate either.

#### `CODE-03` The two CRMs use incompatible auth models: /api/leads accepts the admin key from the URL query string

**HIGH** · CONFIRMED-STATIC · consistency · `src/app/api/leads/route.ts:25`

authorized() in leads/route.ts accepts CRM_ACCESS_KEY from either the x-crm-key header OR url.searchParams.get('key'), while every /api/team*, sign, quo/contacts, and leads/find-email route uses a signed HMAC crm_session cookie. The query-string path leaks a long-lived admin secret into logs, history, and Referer; CrmBoard.tsx persists the raw key in sessionStorage (line 28).

- **Reproduction:** leads/route.ts:25 `return req.headers.get("x-crm-key") === key || url.searchParams.get("key") === key;`. CrmBoard.tsx:28 `sessionStorage.setItem("crm_key", k)`. Compare to the cookie+verifyToken model in the 8 other routes.
- **Observed vs expected:** Observed: admin key accepted from the URL; one CRM uses a static shared key, the other signed cookies. Expected: /api/leads moved onto the cookie-session model with no key-in-URL path.
- **Fix direction:** Drop the searchParams key path and move /api/leads onto the shared getSessionUser cookie model.
- **Verifier note:** Confirmed by reading leads/route.ts:21-26 (query-string key path present) and CrmBoard.tsx:23,28 (sends x-crm-key, stores raw key in sessionStorage). The two auth models are genuinely divergent: all 8 team/sign/quo routes use the crm_session HMAC cookie (grep found exactly 8 hits). Kept high: a long-lived admin secret accepted in a URL query string is a recognized secret-leakage vector (server access logs, browser history, Referer). Mitigations noted: gated behind CRM_ACCESS_KEY being set and /crm is noindex/unlinked, but the key-in-URL path is a real weakness independent of that.

#### `CODE-01` ESLint is not configured, so the lint script cannot run and no static gate protects auto-deploying main

**MEDIUM** · CONFIRMED-STATIC · tooling · `package.json:9`

package.json has "lint": "next lint" (line 10) but no ESLint config exists anywhere in the repo, so the lint script cannot run headless and no static-analysis gate protects the auto-deploying main branch.

- **Reproduction:** find . -path ./node_modules -prune -o -name '.eslintrc*' -o -name 'eslint.config.*' -print returns nothing. package.json:10 defines "lint": "next lint".
- **Observed vs expected:** Observed: no committed ESLint config; the lint script is effectively dead. Expected: a committed config so lint runs headless and gates deploys.
- **Fix direction:** Commit an eslint.config (next/core-web-vitals + @typescript-eslint) and capture the first clean baseline.
- **Verifier note:** Config absence confirmed by find (zero .eslintrc*/eslint.config.* files) and package.json:10. I did NOT re-run `npx next lint` because with no config it prompts to install eslint and WRITE a config file, mutating the shared working copy; the interactive-prompt-plus-exit-1 is next lint's documented behavior for an unconfigured repo, so the fact (no gate) is deterministic. Downgraded high to medium: tsconfig strict:true is on and per AUDIT-PLAN tsc --noEmit is clean, so TypeScript already catches a large class of errors; lint would mainly add no-unused-vars / no-floating-promises coverage. Still a real gap on an auto-deploying prod branch.

#### `CODE-04` Two parallel diverged CRMs: inbound audit-form leads land in a table the working board never reads

**MEDIUM** · CONFIRMED-STATIC · dead-code · `src/app/prospects/Board.tsx:152`

/crm (CrmBoard.tsx + lib/crm.ts) reads the leads table via /api/leads with LEAD_STATUSES (6 stages). /prospects (Board.tsx + lib/prospects.ts) reads team_crm + the audits table + quo-calls with PROSPECT_STAGES (8 stages). The public audit forms POST name+email to /api/leads (leads table, source audit_form), visible only in the unlinked /crm board, while /prospects only shows the audits rows (url+score, no contact info).

- **Reproduction:** grep 'from "@/lib/crm"' -> only CrmBoard.tsx and leads/route.ts. No nav link to /crm. AuditForm.tsx:23 and AuditPopup.tsx:75 POST /api/leads. Board.tsx:156,160,178 fetch /api/team, /api/team/audits, /api/team/quo-calls. LEAD_STATUSES (crm.ts:3, 6 items) vs PROSPECT_STAGES (prospects.ts:3, 8 items).
- **Observed vs expected:** Observed: a homeowner who fills the audit form is only findable in an unlinked second board. Expected: one board, one stage enum, one inbound path.
- **Fix direction:** Consolidate onto /prospects (route audit-form leads into team_crm) or delete /crm + lib/crm + CrmBoard.
- **Verifier note:** Fully confirmed by grep and reads: no href to /crm anywhere; @/lib/crm imported only by CrmBoard.tsx:4 and leads/route.ts:3; AuditForm.tsx:23 and AuditPopup.tsx:75 both POST /api/leads which inserts into the leads table with source audit_form (leads/route.ts:114-120); CrmBoard rendered only by crm/page.tsx:21. /prospects Board.tsx never fetches /api/leads, only team/audits/quo-calls. PROSPECT_STAGES has 8 keys incl. follow_up and replied (prospects.ts:3-12); LEAD_STATUSES has 6 (crm.ts:3-10). The inbound contact-bearing leads are genuinely invisible on the working board. Medium: a real product/data-flow defect, not a crash.

#### `CODE-05` CSV importer silently drops every row when the header uses an unrecognized business-name alias

**MEDIUM** · CONFIRMED · error-handling · `src/app/prospects/Board.tsx:34`

rowsToProspects resolves the name column with col(["name","business","company"]) via exact head.indexOf, then filters with .filter(p => p.name). A common export header like business_name or company_name matches none of the three aliases, so name resolves to -1, every row gets an empty name, and all rows are dropped; doImport reports 'Imported 0' with no explanation. The AUDIT-PLAN's separate BOM sub-claim is NOT reproducible.

- **Reproduction:** Node repro of verbatim parseCSV+rowsToProspects: header 'business_name,phone' with 2 data rows -> 0 rows; 'company_name,phone' -> 0 rows; a leading UTF-8 BOM on 'name,phone' + 2 rows -> 2 rows imported (trim strips U+FEFF). Script: scratchpad/csvtest_verify.mjs.
- **Observed vs expected:** Observed: business_name/company_name headers import 0 of N leads with only a toast. Expected: recognize common aliases or surface a 'no name column found' error.
- **Fix direction:** Broaden the name alias list (business_name, company_name) and warn when no name column is matched instead of silently dropping.
- **Verifier note:** CONFIRMED by running the copied logic in Node: business_name header -> 0 rows, company_name -> 0 rows, while 'name'/'business' controls import correctly. The candidate's refutation of the AUDIT-PLAN's BOM claim is also correct: (BOM+'name').trim() === 'name' is true in Node, so a BOM header still imports 2/2 rows. Verified head.indexOf exact-match at Board.tsx:33 and the terminal .filter(p => p.name) at :51. Medium: a paste of hundreds of leads from a scraper/directory export using business_name silently imports nothing.

#### `CODE-06` Session-cookie parse is copy-pasted inline in 8 routes with the cookie name hardcoded, defeating SESSION_COOKIE

**MEDIUM** · CONFIRMED-STATIC · duplication · `src/app/api/leads/find-email/route.ts:73`

The regex cookie parse plus verifyToken(token ? decodeURIComponent(token) : null) is duplicated inline across 8 routes, with the cookie name as a hardcoded literal even though crm-auth.ts exports SESSION_COOKIE = 'crm_session'. Renaming SESSION_COOKIE silently breaks auth in all 8 routes.

- **Reproduction:** grep of the crm_session cookie regex -> exactly 8 hits: sign:95, team/quo-calls:33, team/seed:9, team:9, team/audits:20, leads/find-email:73, team-login:32, quo/contacts:14. grep SESSION_COOKIE -> defined crm-auth.ts:10, used only in prospects/page.tsx (read) and team-login (set), never in the 8 route regexes.
- **Observed vs expected:** Observed: 8 hardcoded inline parses; SESSION_COOKIE unused by them. Expected: one shared getSessionUser(req) keyed on SESSION_COOKIE.
- **Fix direction:** Add getSessionUser(req) to crm-auth.ts and call it from all 8 routes.
- **Verifier note:** CONFIRMED exactly as described: grep found the identical regex /(?:^|;\s*)crm_session=([^;]+)/ in precisely 8 route files, and SESSION_COOKIE is referenced only in crm-auth.ts:10 (def), prospects/page.tsx:2,17 (read) and team-login:2,26,40 (set), never in the 8 regexes, so it is a genuine rename trap. team/route.ts:8 wraps its copy in currentUser(); the other 7 are bare inline. Medium (rename-time silent auth breakage).

#### `CODE-07` Email-validation regexes are duplicated and not identical, so acceptance differs

**MEDIUM** · CONFIRMED · duplication · `src/app/api/leads/route.ts:15`

Three distinct email regexes exist. leads/book/sign/audit-report use an identical anchored validator /^[^\s@]+@[^\s@]+\.[^\s@]+$/. find-email uses a global extractor requiring a 2+ letter TLD. email.ts uses a third unanchored variant. clamp is duplicated in 3 routes and an inline uid appears in 2 places (Board.tsx:13, sign:45).

- **Reproduction:** grep -> 3 definitions (routes:15/8/77/16 identical; find-email:10 and email.ts:16 divergent). Node test: foo@bar.c and foo@bar.123 pass the route validator (true) but fail find-email's regex (false).
- **Observed vs expected:** Observed: three regex variants for the same job. Expected: one shared isEmail() and clamp().
- **Fix direction:** Extract a single isEmail() and clamp() into a shared lib and migrate all call sites.
- **Verifier note:** CONFIRMED: grep found emailRe identical in leads:15, book:8, sign:77, audit-report:16, plus two divergent EMAIL_RE (find-email:10, email.ts:16). Node test confirms divergence (foo@bar.c: route=true, find=false, lib=true). Honest caveat that softens the framing: the FOUR user-input validators are byte-identical, so a user email is validated the same by every route that validates input; find-email's regex is an HTML-scraping extractor, not a user-input validator, so 'validation behavior is endpoint-dependent' overstates practical impact. Duplication and divergent definitions are nonetheless real. clamp x3 (book:9, audit-report:17, leads:16) and uid (Board.tsx:13 slice(2,10) vs sign:45 slice(2,12), similar not identical) confirmed. Medium duplication.

#### `CODE-08` pricing.ts is not the single source of truth it claims: care-plan prices are duplicated and drift-prone

**MEDIUM** · CONFIRMED-STATIC · magic-value · `src/lib/pricing.ts:165`

The file header (pricing.ts:2) calls itself 'single source of truth for ALL prices', but carePlans[].price (99/249/499 at lines 165/180/195) duplicates the same numbers in priceItems monthlyFounding (99/249/499 at 63/73/83). The same prices are also hardcoded into prospects.ts TEMPLATES ($2,000, $4,500, $99/mo).

- **Reproduction:** pricing.ts monthlyFounding 99/249/499 (63,73,83) vs carePlans price 99/249/499 (165,180,195). grep '2,000|4,500|99/mo' src/lib/prospects.ts -> 218, 321, 348, 349, 350.
- **Observed vs expected:** Observed: the same prices live in three files. Expected: carePlans derives price from priceItems; templates reference constants.
- **Fix direction:** Derive carePlans[].price from the matching priceItems entry and inject template prices from pricing.ts.
- **Verifier note:** CONFIRMED: header 'single source of truth for ALL prices' at pricing.ts:2; monthlyFounding 99/249/499 at 63/73/83 duplicated by carePlans price 99/249/499 at 165/180/195; prospects.ts hardcodes $2,000, $4,500, $99/mo. One line-number correction to the candidate: the $2,000 literals are at prospects.ts:218 (CALL_SCRIPT objection), 321 (TEMPLATES objection) and 348 (email template), NOT 272 as cited (line 272 is the opener and has no price); 321/348/349/350 are correct. Substance stands. Medium.

#### `CODE-09` Untrusted webhook JSON is coerced with inline as-casts instead of validated, so a shape change writes null silently

**MEDIUM** · CONFIRMED-STATIC · type-safety · `src/app/api/quo/webhook/route.ts:81`

Quo and Stripe payloads are external and untrusted but read through inline TS as-casts over a Record<string, unknown> 'Json' type with no runtime schema validation (no zod). A renamed field still compiles under strict mode and the upsert writes null.

- **Reproduction:** quo/webhook/route.ts: context.phoneNumber cast at :50, resource fields cast at :83,86, dialogue/summary typed inline :89-96. webhooks/stripe/route.ts: event.data.object cast at :35,38. No zod in package.json. tsconfig strict:true.
- **Observed vs expected:** Observed: a payload field rename compiles and persists null. Expected: runtime-validated payloads that fail loudly.
- **Fix direction:** Validate webhook bodies with zod or supabase-generated types before the upsert.
- **Verifier note:** CONFIRMED by reading both routes: quo/webhook casts context.phoneNumber as string (:50), resource.createdAt as string (:83), and builds patch.transcript/summary from inline-typed .map/casts (:89-96); handleCall duration is `resource.duration ?? null` (:86) so a rename to e.g. resource.durationSecs yields duration_seconds:null with no error. stripe casts event.data.object to ad-hoc shapes (:35,38). Verified no zod in package.json and tsconfig strict:true, so the cast genuinely bypasses the only static check. Medium type-safety/robustness gap; the null-write is plausible on any upstream rename.

#### `CODE-10` Webhook DB writes swallow errors with no log, so a real outage is indistinguishable from a missing optional table

**MEDIUM** · CONFIRMED-STATIC · error-handling · `src/app/api/quo/webhook/route.ts:101`

The quo/webhook upserts and the stripe payments insert all use .then(() => {}, () => {}) with no console output, intended to tolerate an optional not-yet-created table but also hiding a genuine Supabase outage or schema mismatch. The route still returns a success-shaped 200. leads/book console.error on insert failure, so the codebase is inconsistent.

- **Reproduction:** grep 'then(() => {}, () => {})' -> quo/webhook:101,119,132,143 and stripe:52 (5 swallowed writes, none log). Contrast leads/route.ts:123 console.error on insert failure.
- **Observed vs expected:** Observed: webhook DB failures are invisible. Expected: log the rejection, distinguishing a real error from a 42P01 undefined_table.
- **Fix direction:** Replace the empty reject handler with one that console.errors unless the error is 'relation does not exist'.
- **Verifier note:** CONFIRMED: read the 4 swallowed upserts in quo/webhook (101,119,132,143, each commented 'table optional; best-effort') and the stripe payments insert (:52, 'table optional; ignore if it doesn't exist'). None log. Both webhook routes return {received:true} 200 regardless. leads/route.ts:123 does console.error('[leads] insert failed'). The inconsistency and the outage-vs-missing-table ambiguity are real. Medium.

#### `CODE-11` Client dedup is racy and the shared team doc is last-write-wins, so concurrent edits clobber each other

**MEDIUM** · CONFIRMED-STATIC · consistency · `src/app/prospects/Board.tsx:200`

Board.tsx debounces a full-list PUT of the entire prospects array 800ms after any change, and /api/team PUT is explicitly last-write-wins with no version check. Two team members with the board open overwrite each other. findMissingEmails runs 5 concurrent workers patching state per result while the debounced PUT can ship a stale list. Dedup keys diverge across paths.

- **Reproduction:** Board.tsx:200-206 debounced full-array PUT; team/route.ts:24-32 upsert with no updatedAt precondition (comment 'Last write wins'). Dedup keys: doImport name+phone+10-digit dial (289-301), exportInstantlyCSV email only (364), load-merge audits by domain (163) and quo by phone_digits (180). findMissingEmails 5 workers (401-419).
- **Observed vs expected:** Observed: two open sessions silently clobber; dedup keys diverge. Expected: an optimistic-concurrency check on save and one canonical dedup key.
- **Fix direction:** Send updatedAt with the PUT and reject stale writes; unify the dedup key to normalized phone-digits.
- **Verifier note:** CONFIRMED by reading: Board.tsx:200-206 debounces an 800ms PUT of the whole items array; team/route.ts PUT (24-32) upserts id 'prospects' with a fresh updated_at and NO precondition, and GET returns updatedAt (:20) which the Board never reads back for conflict detection, so it is genuinely last-write-wins. findMissingEmails (392-422) spawns CONCURRENCY=5 workers each calling patch() per result, and the debounced save fires on any state change during the hunt, so a stale/partial list can be persisted. Dedup keys confirmed divergent: name+phone plus dial (289-299), email-only (364), domain (163), phone_digits (180). Medium data-integrity/concurrency concern.

#### `CODE-12` Business-critical thresholds are scattered inline and inconsistent between the two site-fetch routes

**LOW** · CONFIRMED-STATIC · magic-value · `src/app/api/audit/route.ts:12`

The two routes that fetch external sites cap bytes and time differently with no documented reason: audit uses MAX_BYTES 2_500_000, FETCH_TIMEOUT_MS 9000, ROBOTS_TIMEOUT_MS 3500; find-email uses MAX_BYTES 1_500_000, FETCH_TIMEOUT_MS 8000. The audit scoring model is inline literals: weights 0.28/0.22/0.25/0.25, caps 55/45/60, WEIGHT 100/35/0. sign hides rate-limiter constants inline (12/60s, 5000-entry cap).

- **Reproduction:** audit/route.ts:12-14 vs find-email/route.ts:8-9. audit weights 315-318, caps 321-323, WEIGHT :22. sign :15,16,23.
- **Observed vs expected:** Observed: two fetch routes with unexplained different caps and scoring buried inline. Expected: a shared constants module.
- **Fix direction:** Hoist fetch caps and scoring weights/caps into a shared named constants module.
- **Verifier note:** CONFIRMED by reading: audit/route.ts MAX_BYTES 2_500_000 (:12), FETCH_TIMEOUT_MS 9000 (:13), ROBOTS_TIMEOUT_MS 3500 (:14), WEIGHT {pass:100,warn:35,fail:0} (:22), overall weights 0.28/0.22/0.25/0.25 (:315-318), hard caps 55/45/60 (:321-323); find-email FETCH_TIMEOUT_MS 8000 (:8), MAX_BYTES 1_500_000 (:9); sign WINDOW_MS 60_000 (:15), MAX_PER_WINDOW 12 (:16), 5000-entry HITS cap (:23). All literals present as described. Low: maintainability nit, no runtime defect.

#### `CODE-13` API error responses are inconsistent in shape and status code for the same class of failure

**LOW** · CONFIRMED-STATIC · consistency · `src/app/api/leads/find-email/route.ts:77`

No shared JSON responder, so the same failure returns different shapes/codes. A malformed body is 400 in leads/audit/book/sign but folds into a 422 invalid_url in find-email and a 400 missing_fields in quo/contacts. Field-validation is 422 in leads/book but 400 missing_fields in quo/contacts. Webhooks return {received:true} with no ok field.

- **Reproduction:** find-email:77-79 (bad body -> body=null -> 422 invalid_url); quo/contacts:18-19 (bad body -> 400 missing_fields); leads:87 (400 invalid_json); sign:30 (400 'bad'); webhooks return {received:true} (quo/webhook:60, stripe:56).
- **Observed vs expected:** Observed: malformed body yields 400 in one route and 422 in another; inconsistent keys. Expected: one JSON error responder with a stable {ok,error} contract.
- **Fix direction:** Add a shared jsonError(status, code) helper and route all responses through it.
- **Verifier note:** CONFIRMED: find-email/route.ts:77-79 catches a bad body to null then returns 422 invalid_url; quo/contacts:18-19 catches to null then returns 400 missing_fields; leads:87 returns 400 invalid_json; webhooks return {received:true} (no ok field). One correction to the candidate: sign/route.ts:30 returns error:'bad' (not 'invalid_json') for a malformed body and error:'missing' 422 for validation, which only reinforces the inconsistency the finding describes. Low.

#### `CODE-14` Dead exports and an unused import accumulate because nothing flags them

**LOW** · CONFIRMED-STATIC · dead-code · `src/lib/prospects.ts:16`

STAGE_LABEL (prospects.ts:16) has zero callers. fetchCallTranscript (quo.ts:76) and fetchCallSummary (quo.ts:85) are never called (the webhook rebuilds transcript/summary inline). PHONE_FLAG_META is imported into Board.tsx:4 but never used in the 809-line file.

- **Reproduction:** grep STAGE_LABEL -> definition only. grep fetchCallTranscript/fetchCallSummary -> definitions only. grep PHONE_FLAG_META -> definition (prospects.ts:104) + one import (Board.tsx:4), no use.
- **Observed vs expected:** Observed: exported helpers with no callers and an unused import. Expected: removed, or caught by a lint/knip gate.
- **Fix direction:** Delete the dead exports and the unused import; add knip or ts-prune.
- **Verifier note:** CONFIRMED by grep: STAGE_LABEL appears only at its definition (prospects.ts:16); fetchCallTranscript and fetchCallSummary appear only at their definitions (quo.ts:76,85) while the webhook rebuilds the same transcript/summary logic inline (quo/webhook:88-97); PHONE_FLAG_META is imported at Board.tsx:4 and defined at prospects.ts:104 with no usage anywhere in Board.tsx (grep returned only the import line). All three dead-code claims verified. Low.

#### `CODE-15` Seven duplicated money() formatters diverge in rounding, so the same amount renders differently across surfaces

**LOW** · CONFIRMED-STATIC · duplication · `src/lib/pricing.ts:153`

money() is reimplemented in seven places with three behaviors: three unrounded ('$' + n.toLocaleString('en-US')) in pricing.ts:153, pricing/page.tsx:21, agreement.ts:60; three round to nearest dollar in DemoShowcase.tsx:207, SaasVsCustomCalculator.tsx:7, RoiCalculator.tsx:7; one rounds to nearest $50 and omits the en-US locale and special-cases zero in FenceEstimator.tsx:24-27.

- **Reproduction:** grep 'const money = ' -> 7 definitions. pricing.ts already exports one (money at :153).
- **Observed vs expected:** Observed: 7 copies, 3 rounding behaviors. Expected: one exported money() imported everywhere.
- **Fix direction:** Import the single exported money from pricing.ts; keep the $50 rounding as a named variant.
- **Verifier note:** CONFIRMED: grep found exactly 7 money definitions. Verified the three bodies: unrounded ('$'+n.toLocaleString('en-US')) at pricing.ts:153, pricing/page.tsx:21, agreement.ts:60; Math.round-to-dollar at DemoShowcase:207, SaasVsCustomCalculator:7, RoiCalculator:7; and FenceEstimator:24-27 does Math.round(n/50)*50 with a bare toLocaleString() (no en-US) and a v>0 zero special-case. Same fractional amount would render differently across surfaces. Low.

#### `CODE-16` Phone and domain formatting is reimplemented, including an unguarded webhook phone-pretty helper

**LOW** · CONFIRMED · duplication · `src/app/api/quo/webhook/route.ts:63`

prettyPhone in quo/webhook:63 formats a phone with no length guard, duplicating phoneCheck().pretty in prospects.ts:96 which only formats after guarding exactly 10 digits. Every current call site pre-checks digits.length===10 so it cannot emit garbage today, but the copy would produce malformed output on a non-10-digit string. Domain extraction is triplicated (team/audits domainOf, Board.tsx dom(), safe-fetch normalizeUrl; plus a 4th in FeaturedProjects).

- **Reproduction:** Node: prettyPhone('12') -> '(12) -', prettyPhone('12345') -> '(123) 45-'. Guards at quo/webhook:75,108 (if digits.length !== 10 return). Domain strip: team/audits:8, Board.tsx:162, FeaturedProjects.tsx:9.
- **Observed vs expected:** Observed: two phone formatters and 3+ domain extractors. Expected: one shared prettyPhone and domainOf.
- **Fix direction:** Export prettyPhone and domainOf from a shared lib and reuse them.
- **Verifier note:** CONFIRMED: prettyPhone at quo/webhook:63 has no length guard; Node run of the verbatim helper yields malformed output on short input ('(12) -', '(123) 45-'). Confirmed both call sites currently guard (handleCall:75 and handleMessage:108 both `if (digits.length !== 10) return;`), so it cannot emit garbage today, exactly as the candidate honestly states, making this a latent-duplication finding. phoneCheck (prospects.ts:90-100) guards d.length !== 10 before formatting. Domain extraction confirmed duplicated across team/audits/route.ts:7-8 (domainOf), Board.tsx:162 (dom), FeaturedProjects.tsx:9, and safe-fetch normalizeUrl. Low.

---

### 12. Mobile & Responsive

_5 findings: 0 critical, 0 high, 2 medium, 3 low._

#### `MOBILE-01` AuditPopup entry modal has no internal scroll: submit + consent + close are off-screen on short viewports

**MEDIUM** · CONFIRMED-STATIC · clipping · `/home/user/Webfair/src/components/AuditPopup.tsx:95`

- **Reproduction:** Static: AuditPopup.tsx:95 overlay is `fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4` with NO overflow-y-auto; inner card line 104 is `overflow-hidden`; the component never sets document.body.style.overflow. Because the overlay is position:fixed, a card taller than the viewport paints its top (close X, line 110) above y=0 and its bottom (consent line 149, submit line 159) below the viewport, and neither the fixed overlay nor body scroll can reveal them. Contrast MockupModal.tsx:43 which uses `overflow-y-auto ... items-start ... sm:items-center` plus `my-8` on the card (line 50). Content height estimate for the form (badge + 3xl 2-line h2 + paragraph + 3 py-3 inputs + consent + py-4 button + fine print + p-6) is ~535 to 560px, so it exceeds any viewport under ~560px height, which includes every landscape phone (height 375 to 430).
- **Observed vs expected:** Observed: on any viewport shorter than the card (~535 to 560px tall), the centered card overflows top and bottom of a fixed non-scrolling overlay, putting the close X, consent checkbox and submit button off-screen with no scroll path. Expected: overlay scrolls like MockupModal so every control is reachable.
- **Fix direction:** Add overflow-y-auto + items-start (sm:items-center) with vertical margin on the overlay and drop overflow-hidden on the card, mirroring MockupModal.tsx:43/50.
- **Verifier note:** Confirmed the exact class strings at AuditPopup.tsx:95 (no overflow-y-auto, items-center) and :104 (overflow-hidden), and the MockupModal.tsx:43/50 contrast. The defect is structural and certain: whenever card height exceeds viewport height, the controls are unreachable because the overlay is fixed and non-scrolling. Downgraded severity high to medium because the common case (portrait phones, all >=640px tall) fits; the guaranteed-failure band is landscape orientation and unusually short viewports. Exact pixel measurements (559px card in 375px viewport) are dynamic and were not re-run, but they are not needed: the no-scroll structure guarantees clipping once content > viewport height, which is inevitable in landscape.

#### `MOBILE-03` FenceSite sales demo has no hamburger: section nav unreachable below md; 640-767px also loses the sticky CTA

**MEDIUM** · CONFIRMED-STATIC · nav-gap · `/home/user/Webfair/src/components/FenceSite.tsx:93`

- **Reproduction:** Static: FenceSite.tsx:93 nav is `hidden items-center gap-6 ... md:flex` with no hamburger anywhere in the file (grep for <button in FenceSite.tsx returns only estimator/quote form submits at lines 139 and 358, not a menu toggle; no md:hidden nav, no menu state). FenceSite.tsx:382 sticky bar is `fixed inset-x-0 bottom-0 z-50 ... p-3 ... sm:hidden`, so it hides at >=640. Header phone (line 102) is `hidden ... sm:flex` (visible >=640) and Free Quote (line 103) is unconditional, so in 640 to 767 Call and Quote survive but section nav and sticky bar do not.
- **Observed vs expected:** Observed: the six section links (Services, Estimator, Free Tools, Our Work, Guides, Reviews) have no nav affordance at any width below 768, and between 640 and 767 the sticky bottom CTA is also gone; header Call (phone) and Free Quote remain. Expected: a hamburger/chip rail exposes section links below md, and the sticky CTA persists through 640 to 767.
- **Fix direction:** Add a mobile hamburger revealing the section links below md, and raise the bottom CTA from sm:hidden to md:hidden.
- **Verifier note:** Confirmed no hamburger exists in FenceSite.tsx and confirmed both breakpoint gates (:93 hidden md:flex, :382 sm:hidden). The discoverer's correction to the audit-plan wording (header phone and Free Quote stay reachable at >=640) is accurate. Kept medium: this is a live sales demo and the six section links genuinely have zero nav affordance across the entire sub-768 range.

#### `MOBILE-02` Global nav "Get a Free Mockup" CTA may clip ~12px at 768px (iPad portrait)

**LOW** · NEEDS-DYNAMIC-VERIFICATION · horizontal-overflow · `/home/user/Webfair/src/components/Nav.tsx:66`

- **Reproduction:** Static confirms the structure that creates the risk: Nav.tsx:54 links div `hidden items-center gap-9 md:flex` (6 links: Work, Services, Guides, Pricing, Free tools, Contact per content.ts:20-27, with gap-9 = 5 x 36px = 180px of gaps), :66 CTA `hidden md:block`, :79 mobile toggle `md:hidden`, so at exactly 768 all desktop items appear and the toggle disappears. tailwind.config.ts:59 max-w-content=1200, globals.css:135 container-content px-8 at >=640, so the content box at 768 is 704px. globals.css:45 sets html,body overflow-x: clip (hides, not scrolls). Whether logo + 6 gap-9 links + CTA actually exceeds 704px by ~12px depends on rendered text metrics of the system font, which cannot be measured without a running dev server + browser (instructed not to start one).
- **Observed vs expected:** Observed (per discoverer): at 768 to 779px the primary nav CTA right edge lands at ~780px, ~12px past the viewport, and is silently cut by overflow-x: clip. Expected: the md nav row fits within 768px.
- **Fix direction:** Gate the desktop CTA to lg:block, or tighten the md link gap/tracking so the row fits at 768.
- **Verifier note:** All referenced classes and the overflow-x: clip backstop are confirmed present. The mechanism is sound and the discoverer's four measurements are internally self-consistent (button right pinned at 780 for 768/780/800, implying packed content width ~748px from the 32px left pad). But a 12px margin hinges entirely on exact font rendering, so I cannot confirm or refute it statically. Marked NEEDS-DYNAMIC-VERIFICATION per instructions. Severity lowered to low: worst case is a ~12px cosmetic clip of the button's arrow at a narrow 768 to 779px band; the button text and tap target remain intact.

#### `MOBILE-04` Some public interactive controls are 32 to 36px, below the 44x44 Apple HIG / AAA target size

**LOW** · CONFIRMED-STATIC · tap-target · `/home/user/Webfair/src/components/Nav.tsx:79`

- **Reproduction:** Static class facts: Nav.tsx:79 `flex h-9 w-9` (36px); AuditPopup.tsx:110 `flex h-8 w-8` (32px); MockupModal.tsx:56 `flex h-8 w-8` (32px); DemoShowcase.tsx:376 `flex h-8 w-8 shrink-0` (32px). h-9=2.25rem=36px, h-8=2rem=32px, both < 44px.
- **Observed vs expected:** Observed: nav toggle 36x36 (h-9 w-9), AuditPopup close 32x32, MockupModal close 32x32, DemoShowcase send 32x32. Expected (Apple HIG 44 / Material 48 / WCAG 2.5.5 AAA): >=44x44 hit area.
- **Fix direction:** Bump the hit area to >=44x44 (e.g. h-11 w-11 or a padded wrapper) for the nav toggle and the modal/demo close/send buttons.
- **Verifier note:** All four sizes confirmed exactly as class values, so the measurement is not in doubt. Downgraded medium to low because these all PASS WCAG 2.2 AA target size (2.5.8 Target Size Minimum = 24x24 CSS px); they miss only the stricter Apple HIG 44pt, Material 48dp, and WCAG 2.5.5 AAA (44x44). Real usability polish, not an AA violation.

#### `MOBILE-05` FenceSite sticky bottom CTA ignores the iPhone home-indicator safe area

**LOW** · CONFIRMED-STATIC · safe-area · `/home/user/Webfair/src/components/FenceSite.tsx:382`

- **Reproduction:** Static compare: FenceSite.tsx:382 `fixed inset-x-0 bottom-0 z-50 flex gap-2 ... p-3 ... sm:hidden` with no env(safe-area-inset-bottom); StickyCTA.tsx:45 uses `p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ... md:hidden`. The demo bar simply omits the same fix, and being sm:hidden it is exactly the phone width range where notched iPhones apply the inset.
- **Observed vs expected:** Observed: the sticky mobile CTA bar uses plain p-3 (flat 12px bottom padding, no safe-area inset), so on notched iPhones the ~34px home indicator overlaps the lower part of the Call / Free Quote buttons. Expected: reserve the inset like StickyCTA.
- **Fix direction:** Replace p-3 with px-3 pt-3 plus pb-[max(0.75rem,env(safe-area-inset-bottom))] on FenceSite.tsx:382, matching StickyCTA.tsx:45.
- **Verifier note:** Confirmed both class strings verbatim (FenceSite.tsx:382 p-3 with no env() vs StickyCTA.tsx:45 with the max() safe-area pattern). The overlap magnitude on a real notched device is a dynamic detail, but the omission relative to the project's own working pattern is definitive. Severity low as filed.

---
