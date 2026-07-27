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
  {
    slug: "cost-per-lead-calculator",
    name: "Cost Per Lead Calculator",
    short: "Know what a lead is worth",
    blurb:
      "Work out what one lead is actually worth to your business, and the most you can afford to pay for one before advertising stops making money.",
    icon: "target",
    h1: "Cost Per Lead Calculator",
    intro:
      "Most owners buy leads without knowing what one is worth. Enter your average sale, your close rate and your lead volume to see the real value of a single lead, and the maximum you can pay for one and still come out ahead.",
    cta: "Calculate lead value",
    metaTitle: "Cost Per Lead Calculator: What a Lead Is Worth | Stackwrk",
    metaDescription:
      "Free cost per lead calculator. Enter your average sale value, close rate and monthly leads to see what one lead is worth and the maximum you can afford to pay per lead.",
    keywords: [
      "cost per lead calculator",
      "what is a lead worth",
      "lead value calculator",
      "max cost per lead",
      "cpl calculator",
      "how much should i pay per lead",
    ],
    faq: [
      {
        q: "How do you calculate the value of a lead?",
        a: "Multiply your average sale value by your close rate. If your average job is $4,000 and you close one in four leads, each lead is worth $1,000 in revenue on average. That single number is what makes every other advertising decision straightforward.",
      },
      {
        q: "What is a good cost per lead?",
        a: "There is no universal number, it depends entirely on what a lead is worth to you. A $400 cost per lead is a bargain if leads are worth $2,000 and a disaster if they are worth $300. Work out your lead value first, then decide what share of it you are willing to spend to acquire one.",
      },
      {
        q: "How much of a lead's value should I spend acquiring it?",
        a: "Commonly somewhere between 10 and 30 percent, depending on your margins and how much you want to grow. Spending a larger share buys faster growth with thinner profit; spending less protects margin but slows you down. The calculator lets you set this and see the number it implies.",
      },
      {
        q: "Does this account for repeat customers and referrals?",
        a: "No, and that makes it deliberately conservative. It values a lead on the first sale only. If your customers come back or refer others, each lead is genuinely worth more than this shows, so treat the result as a floor rather than a ceiling.",
      },
    ],
  },
  {
    slug: "speed-to-lead-calculator",
    name: "Speed to Lead Calculator",
    short: "What slow replies cost you",
    blurb:
      "Replying first wins a large share of jobs. Estimate the revenue your business loses every month to slow follow-up, and what closing that gap is worth.",
    icon: "bolt",
    h1: "Speed to Lead Calculator",
    intro:
      "In service businesses, whoever replies first usually wins the job. Enter your lead volume, average sale and how fast you typically respond to estimate what slow follow-up is quietly costing you every month.",
    cta: "Calculate the cost",
    metaTitle: "Speed to Lead Calculator: What Slow Replies Cost | Stackwrk",
    metaDescription:
      "Free speed to lead calculator. Estimate the revenue lost to slow follow-up each month, and what replying to every lead within minutes would be worth to your business.",
    keywords: [
      "speed to lead calculator",
      "lead response time",
      "cost of slow lead follow up",
      "how fast should i respond to leads",
      "lead response time revenue",
      "first responder wins",
    ],
    faq: [
      {
        q: "Why does response time matter so much?",
        a: "Because someone requesting a quote is usually contacting several businesses at once, and they are most interested in the minutes right after they hit send. The company that replies while that intent is still hot tends to win a disproportionate share of the work, often before the others reply at all.",
      },
      {
        q: "What counts as a fast response?",
        a: "Minutes, not hours. Replying within about five minutes is the widely cited benchmark for service businesses. An hour later you are usually competing against someone who already spoke to them, and the next morning the job is frequently gone.",
      },
      {
        q: "Where does the uplift number in this calculator come from?",
        a: "It is an assumption you control, not a claim we are making. The default is deliberately conservative and you can adjust it to match what you believe about your own market. The calculator is meant to show you the shape and rough scale of the problem, not to produce a precise forecast.",
      },
      {
        q: "How do I actually reply faster without watching my phone all day?",
        a: "You automate the first touch. An instant automatic reply confirms you received the request within seconds, and every lead from every source lands in one inbox that alerts you immediately, so nothing waits unseen while you are on a job. That is a system, not more discipline.",
      },
    ],
  },
  {
    slug: "software-spend-auditor",
    name: "Software Spend Auditor",
    short: "Add up what your tools really cost",
    blurb:
      "List every subscription your business pays for and see the real monthly, yearly and five-year total, including the price increases nobody budgets for.",
    icon: "trend",
    h1: "Software Spend Auditor",
    intro:
      "Most owners underestimate their software bill because it arrives in a dozen small pieces. List your subscriptions here and see the honest total: what you pay a month, a year, and over five years once normal price increases are included.",
    cta: "Add up my software",
    metaTitle: "Software Spend Auditor: Your Real Subscription Cost | Stackwrk",
    metaDescription:
      "Free software spend auditor. List your business subscriptions to see the true monthly, yearly and 5-year cost, including price increases, and what you could own instead.",
    keywords: [
      "software spend calculator",
      "subscription cost calculator",
      "saas spend audit",
      "how much do i spend on software",
      "business subscription tracker",
      "software cost per year",
    ],
    faq: [
      {
        q: "Why does my software bill feel bigger than it looks?",
        a: "Because it arrives in small pieces. A dozen tools at $40 to $90 a month each never feels like a major expense individually, but together they are often one of the larger line items in a small business, and unlike most costs it grows every year without you agreeing to anything.",
      },
      {
        q: "Why does the total include price increases?",
        a: "Because ignoring them understates what you will actually pay. Subscription prices rise, tiers get restructured, and per-seat tools cost more every time you hire. A five-year projection at today's prices is a fiction, so this adds a modest yearly increase you can adjust.",
      },
      {
        q: "Which subscriptions should I actually cut?",
        a: "Usually none of the cheap, excellent, fixed-price ones like accounting or payments. The candidates worth examining are the expensive per-seat tools that only half fit how you work, especially where you keep a spreadsheet alongside them to make them usable. That combination is where the money is being wasted.",
      },
      {
        q: "What is the alternative to renting all these tools?",
        a: "For the expensive, ill-fitting ones, having a single system built around your actual workflow, which you then own outright and run on cheap flat hosting. It is not always the right answer, and it rarely makes sense for cheap or best-in-class tools. The SaaS versus custom calculator will tell you honestly which side your numbers land on.",
      },
    ],
  },
];

export const getTool = (slug: string): FreeTool | undefined =>
  freeTools.find((t) => t.slug === slug);

export const toolPath = (slug: string) => `/tools/${slug}`;
