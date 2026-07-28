# Stackwrk to-do

Living list of open items. Grouped by who owns each.

## 🚨 Why the site gets no traffic (diagnosed 2026-07-22)

The site is almost certainly **not in Google's index yet**. Evidence: searching
the brand name "Stackwrk" (a unique, made-up word with zero competition)
returns nothing about stackwrk.com. A new domain gets discovered two ways,
and right now neither is happening:

1. **Search Console submission** (see below). Never done, so Google was never
   told the site exists.
2. **Inbound links** from sites Google already crawls. Currently ~zero.

Nothing else (more guides, more tools, better copy) produces a single visitor
until the site is indexed. Fix these three first, in order:

- [x] **1. Search Console + sitemap** (done 2026-07-27). Domain property
      `sc-domain:stackwrk.com` verified, sitemap submitted and read
      successfully: **Success, 32 pages discovered**.
- [x] **2. Link to stackwrk.com from the other live sites Tal owns** (done).
- [x] **3. Fix the www / apex mismatch** (done 2026-07-27). Flipped in Vercel
      so stackwrk.com now serves Production (200) and www.stackwrk.com
      308-redirects to it. Verified live: canonical tag, all 32 sitemap URLs,
      and the served URL now agree, and every sitemap URL returns 200 instead
      of redirecting.

### Next step now that discovery works
- [ ] **URL Inspection -> Request Indexing** on the highest-value pages
      (homepage, /guides, /tools, /services, /pricing). Daily quota is roughly
      10 to 12 URLs. "Discovered" is not the same as "indexed": the sitemap
      told Google the pages exist, this asks it to actually crawl and rank
      them. Expect days to weeks, not hours.
- [ ] Check **Indexing -> Pages** in a week to see how many of the 35 actually
      got indexed, and what Google says about any that did not.

---

# ✅ Step-by-step: do these in order

Everything below is a manual step only you can do. Roughly 20 minutes total.

## Step 1: Telegram lead alerts (~5 min)
The code is live and dormant until these two values exist. Once set, every
form fill on the site pings your phone within seconds.

1. Open Telegram and search for **@BotFather** (the one with the blue check).
2. Send `/newbot`. It asks for a display name (e.g. `Stackwrk Leads`) and then
   a username, which must end in `bot` (e.g. `stackwrk_leads_bot`).
3. BotFather replies with a **token** that looks like
   `8123456789:AAH_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`. Copy it.
4. **Send your new bot a message.** Tap the `t.me/...` link in BotFather's
   reply, press Start, and send it anything, e.g. `hi`. This is required:
   Telegram bots cannot message you until you message them first.
5. Open this URL in a browser, pasting your token in place of `<TOKEN>`:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
   Find `"chat":{"id":123456789` and copy that **number** (it is your chat id).
6. In Vercel -> stackwrk -> Settings -> Environment Variables, add:
   - `TELEGRAM_BOT_TOKEN` = the token from step 3
   - `TELEGRAM_CHAT_ID` = the number from step 5
7. Redeploy (Deployments -> latest -> Redeploy).
8. **Test it:** go to stackwrk.com, submit the mockup form with your own
   email. Your phone should buzz within a few seconds. If it does not, tell
   Claude and it will check the logs.

## Step 2: Request indexing in Search Console (~5 min)
1. Search Console -> **URL inspection** (left sidebar).
2. Paste each URL below, wait for it to load, click **Request Indexing**:
   - `https://stackwrk.com`
   - `https://stackwrk.com/guides`
   - `https://stackwrk.com/tools`
   - `https://stackwrk.com/services`
   - `https://stackwrk.com/pricing`
   - `https://stackwrk.com/tools/cost-per-lead-calculator`
   - `https://stackwrk.com/tools/speed-to-lead-calculator`
   - `https://stackwrk.com/tools/software-spend-auditor`
3. Daily quota is about 10 to 12 URLs, so stop if it starts refusing and
   finish the rest tomorrow.

## Step 3: Confirm the newsletter works (~2 min)
1. Go to `stackwrk.com/guides` and scroll to the bottom.
2. Enter your own email in the newsletter strip and subscribe.
3. Check it arrived: the subscriber shows in Supabase under `leads` with
   source `newsletter`, and (once Step 1 is done) pings your Telegram.

## Step 4: Ongoing, once a week
- [ ] Search Console -> **Performance**: which queries are you appearing for?
      That data decides which guides to write next.
- [ ] Search Console -> **Indexing -> Pages**: how many pages are indexed, and
      why any are excluded.
- [ ] CRM: work the leads. The alerts only matter if the reply is fast.

**Realistic timeline:** even done perfectly, SEO traffic takes ~3 to 6 months
to matter on a new domain. For clients *this month*, the outbound channels
(call list, WhatsApp, DMs) are the answer, not the website.

## Tal (setup, no code)
- [ ] **Google Search Console** (biggest SEO item): verify stackwrk.com and submit the sitemap. Steps:
      1. Go to search.google.com/search-console, click "Add property".
      2. Pick the "URL prefix" option, enter `https://stackwrk.com`.
      3. Verify. Easiest on Vercel: choose the "HTML tag" method, copy the
         `<meta name="google-site-verification" ...>` content value, and send it
         to me. I will add it to the site so verification passes (or use the DNS
         TXT method in your domain registrar if you prefer).
      4. Once verified: Sitemaps (left menu) -> enter `sitemap.xml` -> Submit.
      5. Also submit key URLs via "URL Inspection" -> "Request indexing" for the
         homepage and the top guides to speed up first crawl.
- [ ] **GA4**: create a GA4 property (analytics.google.com), copy the `G-XXXXXXX`
      measurement id, add it in Vercel as `NEXT_PUBLIC_GA_ID`, redeploy. (Code is
      already in, dormant until the id is set.)
- [ ] **Microsoft Clarity** (free heatmaps + recordings): create a project at
      clarity.microsoft.com, copy the project id, add it in Vercel as
      `NEXT_PUBLIC_CLARITY_ID`, redeploy. (Code already in, dormant.)
- [ ] **Google Business Profile**: optimize it (see playbook/06). Paste the public
      Maps link here and I will review it against the checklist.
- [ ] **LinkedIn URL**: send it. I will wire it into the footer and the site
      Organization schema (sameAs).
- [ ] **Test the money path**: with Stripe keys set, sign a test agreement and
      click pay to confirm you reach Stripe checkout.
- [x] Supabase migrations run.
- [x] Env keys set (Supabase, CRM, Resend, Stripe, site).
- [x] Quo webhook + allowlist configured.
- [~] **Vercel Speed Insights**: declined for now (costs $10/mo on the Pro plan).

## On hold (Tal to greenlight)
- [ ] **AI tools** (need an Anthropic API key, then I build):
      1. 24/7 AI chat assistant on the site (qualifies leads, books calls, and
         demonstrates the exact product we sell).
      2. AI-personalized audit advice in the report.
      3. AI mini-tools as lead magnets (meta-description writer, headline
         analyzer, review responder).

## Claude (code, in progress)
- [ ] Keep publishing guides (15 of ~100 mapped live; writing more).
- [ ] More free tools / calculators (candidates in the strategy notes).
- [ ] Finish the remaining low-priority audit findings (minor SEO metadata,
      code-quality cleanups, a few data/reliability edge cases).
- [ ] Larger image-optimization pass (next/image or AVIF) when prioritized.
- [ ] Per-industry / per-city guide expansion: NOT YET. Wait until the core
      guides rank and we can add real per-trade substance (thin variants now
      would risk a doorway-page penalty on a young domain).
