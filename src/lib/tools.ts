/**
 * Free-tools registry: the single source of truth for the /tools hub, each
 * standalone tool page, the sitemap, and nav. Data-only (no JSX) so it can be
 * imported from both server and client components.
 *
 * Each tool doubles as an SEO/AIO landing page: a genuinely useful free tool at
 * the top (the lead magnet) and structured, answerable content below (FAQ →
 * FAQPage schema) so search + AI answer engines can cite it.
 */

export type ToolIcon = "bolt" | "trend" | "chat" | "target";

export type FaqItem = { q: string; a: string };

export type FreeTool = {
  slug: string;
  name: string;
  /** one-line label used on cards + nav */
  short: string;
  /** hub-card paragraph */
  blurb: string;
  icon: ToolIcon;
  /** on-page H1 + intro */
  h1: string;
  intro: string;
  cta: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  faq: FaqItem[];
};

export const freeTools: FreeTool[] = [
  {
    slug: "website-audit",
    name: "Instant Website Audit",
    short: "Score your site in seconds",
    blurb:
      "A free, Lighthouse-style scorecard for any website: speed, mobile, SEO and the conversion gaps quietly costing you customers.",
    icon: "bolt",
    h1: "Free Instant Website Audit",
    intro:
      "Drop in any website and get a 0 to 100 scorecard in seconds: load speed, mobile-friendliness, SEO basics and the conversion gaps that lose you customers. No signup to see your score.",
    cta: "Audit my website",
    metaTitle: "Free Instant Website Audit: Speed, SEO & Mobile Score | Stackwrk",
    metaDescription:
      "Run a free instant website audit. Get a 0 to 100 score for speed, mobile-friendliness, SEO and conversion in seconds, no signup. See exactly what's costing you customers.",
    keywords: [
      "free website audit",
      "website speed test",
      "seo checker",
      "site performance score",
      "mobile friendly test",
      "website grader",
    ],
    faq: [
      {
        q: "Is the website audit really free?",
        a: "Yes. You can run the audit and see your full 0 to 100 scorecard for free, with no signup. If you want the detailed report emailed to you with fixes, you just add your name and email.",
      },
      {
        q: "What does the audit check?",
        a: "It checks load speed, page weight, mobile-friendliness, core SEO signals (title, meta description, headings, indexability), HTTPS security and common conversion gaps, the same categories a Lighthouse audit weighs.",
      },
      {
        q: "How is the score calculated?",
        a: "Each category (speed, mobile, SEO, conversion) is scored 0 to 100 and weighted into an overall grade. Hard problems like a missing HTTPS certificate or a page blocked from search engines cap the score, the way a real Lighthouse-grade audit would.",
      },
      {
        q: "Will you fix the issues it finds?",
        a: "We can. Stackwrk builds fast, conversion-focused websites and offers care plans that keep your score high. Book a free call and we'll walk through your report together.",
      },
    ],
  },
  {
    slug: "roi-calculator",
    name: "Website ROI Calculator",
    short: "See what a better site is worth",
    blurb:
      "Estimate the monthly revenue a faster, higher-converting website could recover, based on your real traffic and average sale value.",
    icon: "trend",
    h1: "Website ROI Calculator",
    intro:
      "See the revenue a better website is actually worth. Enter your monthly visitors and average sale value, and we'll estimate the extra revenue a higher-converting site could recover every month.",
    cta: "Calculate my ROI",
    metaTitle: "Website ROI Calculator: What a Better Site Is Worth | Stackwrk",
    metaDescription:
      "Free website ROI calculator. Enter your monthly visitors and average sale value to estimate the revenue a higher-converting website could recover every month.",
    keywords: [
      "website roi calculator",
      "conversion rate revenue calculator",
      "website value calculator",
      "web design roi",
      "conversion rate optimization calculator",
    ],
    faq: [
      {
        q: "How does the ROI calculator work?",
        a: "It multiplies your monthly visitors by a conversion rate and your average sale value to estimate revenue, then compares a typical current conversion rate against the rate a well-built, fast site tends to achieve. The gap is the revenue you're likely leaving on the table.",
      },
      {
        q: "Where do the conversion rates come from?",
        a: "The defaults are conservative industry benchmarks: around 1 to 2% for a dated or slow site and 4 to 5% for a fast, conversion-focused one. Your real numbers depend on your traffic quality and offer, so treat the result as an illustrative estimate.",
      },
      {
        q: "Is a better website really worth it?",
        a: "For most small businesses, recovering even one or two extra conversions a week pays for the site many times over within a year. The calculator makes that trade-off concrete before you spend a dollar.",
      },
    ],
  },
  {
    slug: "saas-vs-custom-calculator",
    name: "SaaS vs Custom Software Calculator",
    short: "See when owning beats renting",
    blurb:
      "Compare years of stacked monthly software subscriptions against a one-time custom build, and see the point where owning your software costs less than renting it.",
    icon: "trend",
    h1: "SaaS vs Custom Software Calculator",
    intro:
      "Stacking monthly subscriptions forever, or building custom software once? Enter your real numbers and see the total cost of each over time, when a custom build breaks even, and whether owning actually wins for you (sometimes it does not, and this will tell you honestly).",
    cta: "Compare the cost",
    metaTitle:
      "SaaS vs Custom Software Cost Calculator: When Owning Wins | Stackwrk",
    metaDescription:
      "Free calculator comparing years of SaaS subscriptions against a one-time custom software build. See the 5-year cost of each, the break-even point, and whether building beats renting for your business.",
    keywords: [
      "saas vs custom software cost",
      "build vs buy software calculator",
      "cost of custom software vs subscriptions",
      "when is custom software worth it",
      "software subscription cost calculator",
      "5 year saas cost calculator",
    ],
    faq: [
      {
        q: "How does the SaaS vs custom calculator work?",
        a: "It projects your current monthly software spend forward over the years you choose, growing it each year for seat growth and price increases, and adds it up. Then it compares that running total against a one-time custom build plus small monthly hosting. Where the custom line drops below the subscription line is your break-even point.",
      },
      {
        q: "What numbers should I put in?",
        a: "Use the total monthly cost of only the tools a single custom system could realistically replace (count every seat), a realistic yearly growth for that spend (seat growth plus price creep, often 10 to 15 percent), and an estimated one-time build cost. If you are unsure of the build cost, start with a low-five-figure estimate and adjust.",
      },
      {
        q: "Does custom software always come out cheaper?",
        a: "No, and this calculator will show you when it does not. With one or two users or a small, flat subscription bill, renting is usually the cheaper, lower-risk choice. Owning tends to win once your replaceable per-seat spend is a few hundred dollars a month and climbing, and the longer your time horizon, the sooner it pays off.",
      },
      {
        q: "Is the result exact?",
        a: "It is an honest estimate, not a quote. Real build costs depend on scope and real subscription costs depend on your exact tools and growth. Use it to see the shape of the decision and roughly where break-even lands, then get a real build estimate before committing.",
      },
    ],
  },
];

export const getTool = (slug: string): FreeTool | undefined =>
  freeTools.find((t) => t.slug === slug);

export const toolPath = (slug: string) => `/tools/${slug}`;
