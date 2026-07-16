/**
 * Stackwrk guides: the real, non-templated long-tail content library.
 *
 * Each guide targets one specific search a small-business owner actually types,
 * and answers it better than what currently ranks: a worked dollar example, a
 * real before/after, a fill-in checklist, or an honest comparison table. The
 * pages interlink into clusters (hub-and-spoke) so authority compounds instead
 * of scattering, and every article emits Article + FAQPage + BreadcrumbList
 * JSON-LD so search engines and AI answer engines can quote it.
 *
 * Rendered by /guides (hub) and /guides/[slug] (article).
 *
 * Writing rules for anything added here: no em dashes, ever. Lead with the
 * answer, use real numbers, keep the intent aligned to the page type.
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title?: string; text: string }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] }
  | { type: "quote"; text: string; cite?: string };

export type GuideFaq = { q: string; a: string };

export type GuideIntent = "informational" | "commercial" | "transactional";

export type Guide = {
  slug: string;
  clusterId: string;
  title: string; // H1 + default SEO title
  metaTitle?: string; // overrides the <title> when set
  description: string; // meta description + hub excerpt
  targetQuery: string; // the search this page is built to win
  intent: GuideIntent;
  readMins: number;
  date: string; // ISO published
  updated?: string; // ISO last-reviewed
  /** Quick-answer bullets shown up top. Great for featured snippets + AI overviews. */
  takeaways: string[];
  body: GuideBlock[];
  faqs: GuideFaq[];
  /** Slugs of sibling guides to interlink to (keeps authority inside the cluster). */
  related: string[];
  /** Optional per-article CTA override. */
  cta?: { heading: string; body: string; button?: string };
};

export type Cluster = {
  id: string;
  name: string;
  /** One-line promise for the hub page. */
  blurb: string;
};

export const CLUSTERS: Cluster[] = [
  {
    id: "own-it",
    name: "Own it, don't rent it",
    blurb:
      "When custom software beats stacking monthly subscriptions, and how to run the math for your own business.",
  },
  {
    id: "automation",
    name: "Automate the busywork",
    blurb:
      "Kill the manual work that eats your week: lead entry, follow-ups, reminders, invoicing, reporting.",
  },
  {
    id: "crm",
    name: "A CRM that fits",
    blurb:
      "Custom CRMs and lead systems built around how you actually quote, schedule, and close, with no per-seat fees.",
  },
  {
    id: "websites",
    name: "Websites that book jobs",
    blurb:
      "Sites built to turn searches into booked work, not just look nice. Conversion first.",
  },
  {
    id: "ai",
    name: "Practical AI",
    blurb:
      "AI used as the how, not the headline: internal tools, assistants, and document work that pay for themselves.",
  },
  {
    id: "integrations",
    name: "Make your tools talk",
    blurb:
      "Stop double entry and mismatched numbers. One source of truth across the apps you already run.",
  },
  {
    id: "internal-tools",
    name: "Beyond spreadsheets",
    blurb:
      "Custom internal tools, dashboards, and ops systems for when the spreadsheet finally breaks.",
  },
];

export const clusterById = (id: string) => CLUSTERS.find((c) => c.id === id);

// ---------------------------------------------------------------------------
// The library. Ordered newest-first for the hub's "Latest" strip.
// ---------------------------------------------------------------------------

export const GUIDES: Guide[] = [
  {
    slug: "custom-crm-for-fencing-exterior-contractors",
    clusterId: "crm",
    title: "Custom CRM for Fencing & Exterior Contractors",
    metaTitle: "Custom CRM for Fencing & Exterior Contractors (Built to Fit)",
    description:
      "Off-the-shelf CRMs make fence and exterior crews bend to the software. Here is what a CRM built around how you quote, schedule, and follow up looks like, and what it costs versus per-seat tools.",
    targetQuery:
      "custom crm for fencing exterior contractors that fits how we quote and schedule",
    intent: "transactional",
    readMins: 7,
    date: "2026-07-16",
    updated: "2026-07-16",
    takeaways: [
      "A fitted CRM matches your real pipeline (lead, measured, quoted, scheduled, installed, paid), not a generic sales funnel you have to fake.",
      "Contractors usually stitch together a spreadsheet, texts, a notes app, and QuickBooks. A custom CRM puts every lead and job in one place, on any phone.",
      "Per-seat tools like Jobber and Housecall Pro charge every crew member every month, forever. A custom build is a one-time cost you own.",
      "You do not need enterprise software. You need the five screens you actually use, built well, with the busywork automated.",
    ],
    body: [
      {
        type: "p",
        text: "If you install fences, gates, decks, pavers, or screen enclosures, you already know the CRM problem: every tool on the market was built for a software sales team, and you spend your day forcing your work into fields that were never meant for it. A lead becomes a \"deal,\" a site visit becomes a \"meeting,\" and the actual job (measure, quote, permit, schedule, install, final walk, invoice) gets crammed into notes nobody reads on site.",
      },
      {
        type: "p",
        text: "A custom CRM flips that. Instead of you bending to the software, the software is shaped around exactly how a fence and exterior crew runs. Here is what that means in practice, what it costs versus the per-seat tools, and how to tell whether you are ready for one.",
      },
      { type: "h2", text: "Why off-the-shelf CRMs fight contractors" },
      {
        type: "p",
        text: "The generic tools are not bad software. They are just built for a different job. Three things break down fast once a real fence company tries to run on them:",
      },
      {
        type: "ul",
        items: [
          "The pipeline is wrong. A fence job is not \"lead to closed-won.\" It is lead, site measure, written quote, deposit, permit, scheduled install, install, final walk, balance paid. Force that into a five-stage sales funnel and half your jobs live in a stage that does not describe reality.",
          "The field is not the office. Your crew is on a phone in a backyard, not at a desk. Most CRMs are a wall of tabs on mobile. The one thing a tech needs (today's stops, the customer's number, the measurements, the gate photo) is four taps deep.",
          "You pay per person to touch it. Add your estimator, your two install leads, and your office help, and a $49-per-seat plan is $245 a month before you have booked a single job. That never stops.",
        ],
      },
      {
        type: "callout",
        title: "The real-world stack most crews run today",
        text: "A shared Google Sheet for leads, texts and voicemails for scheduling, a notes app or clipboard for measurements, photos buried in a camera roll, and QuickBooks for invoicing. Nothing talks to anything, so the same job gets written down four times and something always slips.",
      },
      { type: "h2", text: "What a fitted CRM actually looks like" },
      {
        type: "p",
        text: "A custom CRM for a contractor is not more software. It is less: the handful of screens you truly use, built to match your day, with the repetitive parts automated. For a fence and exterior business that usually comes down to:",
      },
      {
        type: "ol",
        items: [
          "One lead inbox. Every lead (website form, Google, Facebook, a referral, a missed call) lands in one list automatically, tagged with where it came from, so nothing gets copied by hand and nothing gets lost.",
          "A pipeline in your words. Columns that read New, Measured, Quoted, Deposit, Scheduled, Installed, Paid. Drag a card, everyone sees it move.",
          "A job card that lives in the field. Tap a lead and you see the address with a map link, the phone with tap-to-call, the measurements, the photos, the quote, and the balance due. Built for a thumb on a jobsite.",
          "Quote and follow-up automation. The moment a quote sits three days without a yes, the system nudges the customer for you. No quote goes cold because you got busy on an install.",
          "Money that syncs. The deposit and final invoice flow to QuickBooks (or your accounting tool) without you re-typing the customer twice.",
        ],
      },
      {
        type: "p",
        text: "None of that is exotic. It is the exact shape of the CRM we run inside Stackwrk to manage our own leads and calls, which is the point: it is built from how the work actually happens, not from a template.",
      },
      { type: "h2", text: "The before and after" },
      {
        type: "table",
        caption: "A typical fence company's week, before and after a fitted CRM.",
        head: ["What happens", "Off-the-shelf / spreadsheet", "Custom CRM"],
        rows: [
          [
            "A new website lead comes in",
            "You get an email, copy it into the sheet later (if you remember)",
            "It is already in the pipeline, tagged \"website,\" you get a text",
          ],
          [
            "Following up on a quote",
            "You scroll the sheet on Sunday and hope you caught them all",
            "Auto-nudge fires at day 3 and day 7 until they reply",
          ],
          [
            "Scheduling the install",
            "Texts back and forth, written on a whiteboard",
            "Drag the card to Scheduled, crew sees it on their phone",
          ],
          [
            "Invoicing the balance",
            "Re-type the customer into QuickBooks",
            "Customer and job already synced, one click to invoice",
          ],
          [
            "Adding a second estimator",
            "Another $49+ per month, forever",
            "Add a login, $0 more",
          ],
        ],
      },
      { type: "h2", text: "What it costs versus per-seat tools" },
      {
        type: "p",
        text: "This is the number that matters, so here is an honest version of it. Say you run Jobber or Housecall Pro with four people touching the system at roughly $50 a seat. That is about $200 a month, or $2,400 a year, and it climbs as you add people or hit the next plan tier.",
      },
      {
        type: "table",
        caption: "Illustrative five-year cost. Your real numbers depend on seats and plan tier.",
        head: ["", "Per-seat SaaS (4 seats)", "Custom CRM (owned)"],
        rows: [
          ["Up-front build", "$0", "one-time project"],
          ["Year 1", "~$2,400", "hosting only (often under $30/mo)"],
          ["Years 1 to 5", "~$12,000 and rising", "hosting only, you own the software"],
          ["Add a 5th user", "+$600/yr", "$0"],
          ["Own your data and code", "No", "Yes"],
        ],
      },
      {
        type: "p",
        text: "The point is not that custom is always cheaper on day one. It is not. The point is where the lines cross. A per-seat tool is a bill that grows with your business forever; an owned system is a one-time build plus small hosting. The more people touch it and the longer you run, the more the math favors owning it. We break the full calculation down in the guide on when custom software beats subscriptions.",
      },
      { type: "h2", text: "Signs you are ready for a custom CRM" },
      {
        type: "p",
        text: "You do not need one on day one. You need one when the spreadsheet starts costing you jobs. Run down this list:",
      },
      {
        type: "ul",
        items: [
          "You have lost or forgotten to follow up on a quote in the last month.",
          "You pay for three or more tools that each do part of the job and none that do all of it.",
          "You re-type the same customer into more than one system.",
          "Your per-seat software bill has crossed roughly $150 to $200 a month.",
          "Your crew cannot see today's jobs and the customer's details on their phone in one tap.",
          "You have outgrown Jobber or Housecall Pro and keep hitting walls the software will not bend around.",
        ],
      },
      {
        type: "callout",
        title: "Three or more? It is worth a conversation.",
        text: "That does not mean you need a $50,000 platform. It usually means the five screens you actually use, built right, would pay for themselves in saved hours and saved jobs inside the first year.",
      },
      { type: "h2", text: "How we build it" },
      {
        type: "p",
        text: "We start from your day, not a feature list. A short call to map how a lead becomes a paid job, then a working pipeline you can click within a couple of weeks, then the automations layered on. You own the code and the data at the end. If you already run Jobber, QuickBooks, or a booking tool, we can keep the parts that work and build only the piece that is missing, rather than rip and replace.",
      },
    ],
    faqs: [
      {
        q: "Is a custom CRM overkill for a small fence company?",
        a: "Not if it is scoped right. A custom CRM does not mean enterprise software. For a small crew it means the handful of screens you actually use (a lead inbox, a pipeline, a field-ready job card, and follow-up automation) built to fit your workflow, without the per-seat fees. The goal is less software that fits, not more software.",
      },
      {
        q: "How is this different from Jobber or Housecall Pro?",
        a: "Jobber and Housecall Pro are solid, but they are the same for every trade and they charge per user every month. A custom CRM is shaped around your exact pipeline and stages, runs on a one-time build plus small hosting instead of a growing per-seat bill, and you own the data and code. Many contractors move to custom once they outgrow the rigid parts of those tools.",
      },
      {
        q: "Can it connect to QuickBooks and the tools I already use?",
        a: "Yes. A custom CRM can sync customers and invoices to QuickBooks, pull leads from your website and Facebook, and connect to your phone or booking system, so you stop entering the same customer in two places. We keep the tools that already work for you and build only the missing piece.",
      },
      {
        q: "What does a custom CRM for a contractor cost?",
        a: "It is a one-time build rather than a monthly per-seat fee, plus small hosting (often under $30 a month). The build cost depends on how many screens and automations you need. The honest way to decide is to compare it against what your growing per-seat software bill will total over the next three to five years.",
      },
      {
        q: "How long does it take to build?",
        a: "A working pipeline you can start using is usually a couple of weeks. Automations and integrations layer on from there. You do not wait months for a big-bang launch; you get a usable core early and grow it.",
      },
    ],
    related: [
      "how-many-saas-subscriptions-before-custom-software-is-worth-it",
      "stop-copying-leads-into-a-spreadsheet-by-hand",
    ],
    cta: {
      heading: "Want to see your pipeline in a real CRM?",
      body: "I will map how your leads become paid jobs and show you what a CRM built around it looks like. No cost, no pressure.",
      button: "Book a fit call",
    },
  },

  {
    slug: "how-many-saas-subscriptions-before-custom-software-is-worth-it",
    clusterId: "own-it",
    title: "How Many SaaS Subscriptions Before Custom Software Is Worth It?",
    metaTitle: "How Many SaaS Subscriptions Before Custom Software Pays Off?",
    description:
      "A straight answer with the actual math: when stacking monthly software subscriptions costs more than building and owning custom software, and how to run the tipping-point number for your own business.",
    targetQuery: "how many saas subscriptions before custom software is worth it",
    intent: "commercial",
    readMins: 6,
    date: "2026-07-16",
    updated: "2026-07-16",
    takeaways: [
      "There is no magic number of apps. The tipping point is about total monthly spend, how many people pay per seat, and how long you will keep running the stack.",
      "A rough rule: when overlapping tools cross roughly $300 to $500 a month and keep climbing, custom software usually pays for itself within one to three years.",
      "Custom software is a one-time cost you own; SaaS is a bill that grows with your headcount and never ends.",
      "Do not build to replace one cheap, excellent tool. Build to replace a stack of overlapping ones you are outgrowing.",
    ],
    body: [
      {
        type: "p",
        text: "The honest answer is that it is not the count of subscriptions that decides it, it is the math underneath them. You can happily run twenty cheap tools that each do one thing well. You can also be bleeding money on four overlapping ones that charge per seat. So instead of chasing a magic number, here is the actual calculation, with a worked example, so you can find your own tipping point.",
      },
      { type: "h2", text: "The three numbers that decide it" },
      {
        type: "p",
        text: "Whether custom software beats your subscriptions comes down to three things, not the length of your app list:",
      },
      {
        type: "ol",
        items: [
          "Total monthly spend on the tools a custom system would replace. Add only the ones that overlap or that a single fitted system could absorb.",
          "How it scales. Per-seat pricing is the quiet killer. A tool that is $49 today is $245 when five people use it, and it grows every time you hire.",
          "How long you will run it. Software you will use for five years is a very different decision from a stopgap you will drop in six months.",
        ],
      },
      {
        type: "callout",
        title: "The one-line version",
        text: "If your replaceable, per-seat, long-lived software spend is high and climbing, custom wins. If it is a couple of cheap fixed-price tools you will not outgrow, keep renting.",
      },
      { type: "h2", text: "A worked example" },
      {
        type: "p",
        text: "Take a small service business running a fairly normal stack. None of these tools is expensive on its own. Together, and priced per seat, they add up:",
      },
      {
        type: "table",
        caption: "An illustrative stack. Plug in your own tools and seats.",
        head: ["Tool", "Job it does", "Monthly (with seats)"],
        rows: [
          ["CRM (per seat x4)", "Leads and pipeline", "~$200"],
          ["Scheduling / booking", "Jobs and appointments", "~$60"],
          ["Automation (Zapier tier)", "Connecting the apps", "~$70"],
          ["Form / lead capture", "Website leads", "~$40"],
          ["Reporting add-on", "Dashboards", "~$50"],
          ["Total", "", "~$420 / month"],
        ],
      },
      {
        type: "p",
        text: "That is about $420 a month, or roughly $5,000 a year, and it climbs every time you add a person or hit the next plan tier. Over three years, before any growth, that stack costs around $15,000. Over five years it is closer to $25,000 and still rising.",
      },
      {
        type: "p",
        text: "Now put a custom system next to it. A fitted build that absorbs most of that stack is a one-time project plus hosting (often under $30 a month). Whatever the build costs, the comparison is not build-versus-zero. It is build-plus-cheap-hosting versus a $5,000-a-year bill that never stops and grows with your team.",
      },
      {
        type: "table",
        caption: "Where the lines cross (illustrative).",
        head: ["Time horizon", "SaaS stack", "Custom (build + hosting)"],
        rows: [
          ["Year 1", "~$5,000", "build cost + ~$360"],
          ["Year 3", "~$15,000 and rising", "same build + ~$1,080 hosting"],
          ["Year 5", "~$25,000+", "same build + ~$1,800 hosting"],
          ["Each new hire", "adds per-seat cost", "$0"],
        ],
      },
      {
        type: "p",
        text: "For most small businesses, a build in the low five figures crosses over somewhere between year one and year three, and everything after the crossover is money you keep. The heavier your per-seat count and the longer your horizon, the sooner it pays off.",
      },
      { type: "h2", text: "When you should NOT build" },
      {
        type: "p",
        text: "Custom is not always the answer, and anyone who tells you it is has something to sell. Keep renting when:",
      },
      {
        type: "ul",
        items: [
          "The tool is cheap, fixed-price, and best-in-class at one thing (accounting, email, payments). Do not rebuild QuickBooks or Stripe.",
          "Your process is still changing fast. Build once it is stable, not while you are still figuring out how you work.",
          "The total replaceable spend is genuinely low and flat. If four tools cost $120 a month and will not grow, the math does not clear.",
          "You need it live next week. Custom is worth the wait when the payoff is years; it is the wrong call for an emergency stopgap.",
        ],
      },
      {
        type: "callout",
        title: "The pattern to build for",
        text: "The best custom builds do not replace one great tool. They collapse a stack of overlapping, per-seat, half-fitting tools into one system that matches how you actually work, and they stop the bill from growing every time you hire.",
      },
      { type: "h2", text: "How to run your own number in five minutes" },
      {
        type: "ol",
        items: [
          "List every tool a single fitted system could realistically replace.",
          "Write the true monthly cost of each, counting every seat.",
          "Add them up, then multiply by 12, then by the number of years you will run this.",
          "Add roughly 10 to 20 percent a year for seat growth and price increases.",
          "Compare that total against a one-time build plus small hosting. If the stack total is well above the build, owning it wins.",
        ],
      },
      {
        type: "p",
        text: "If you want, I can run that number with you against your real stack and tell you honestly whether it clears. Sometimes it does not, and I will say so.",
      },
    ],
    faqs: [
      {
        q: "Is there a number of apps where custom software always wins?",
        a: "No. It is about dollars, not app count. A better trigger is total monthly spend on overlapping, per-seat tools you will run for years. As a rough guide, once that replaceable spend crosses about $300 to $500 a month and keeps climbing, a custom build usually pays for itself within one to three years.",
      },
      {
        q: "Isn't custom software way more expensive than a subscription?",
        a: "It costs more up front and less over time. SaaS looks cheap monthly but never stops and grows with your headcount. Custom is a one-time build plus small hosting that you own. The right comparison is the build cost against three to five years of the growing subscription bill it replaces, not against zero.",
      },
      {
        q: "What is the tipping point for a small business?",
        a: "For most small businesses, a build in the low five figures crosses over between year one and year three, driven mostly by how many people pay per seat and how long you keep the system. The heavier the per-seat count, the faster it pays off.",
      },
      {
        q: "Should I replace all my software with one custom system?",
        a: "No. Keep the cheap, best-in-class fixed-price tools like accounting, email, and payments. Custom software should replace the stack of overlapping, per-seat, half-fitting tools you are outgrowing, not the ones that already work well and cost little.",
      },
    ],
    related: [
      "custom-crm-for-fencing-exterior-contractors",
      "stop-copying-leads-into-a-spreadsheet-by-hand",
    ],
    cta: {
      heading: "Want the math run on your actual stack?",
      body: "Send me your tools and seats and I will tell you honestly whether owning beats renting, including when it does not.",
      button: "Run my number",
    },
  },

  {
    slug: "stop-copying-leads-into-a-spreadsheet-by-hand",
    clusterId: "automation",
    title: "Stop Copying Leads From Email and Forms Into a Spreadsheet by Hand",
    metaTitle: "Stop Copying Leads Into a Spreadsheet by Hand (Automate It)",
    description:
      "Manually re-typing every lead from email, forms, and Facebook into a spreadsheet is slow, error-prone, and loses you jobs. Here is what the manual habit really costs and how to make leads land in one place automatically.",
    targetQuery:
      "stop copying leads from email and web forms into a spreadsheet by hand",
    intent: "transactional",
    readMins: 6,
    date: "2026-07-16",
    updated: "2026-07-16",
    takeaways: [
      "Copying leads by hand is not just slow. It drops leads, creates typos, and adds a delay that quietly kills your reply speed, which is the single biggest driver of who wins the job.",
      "The fix is a small automation: every lead source feeds one list automatically, tagged with where it came from, the moment it arrives.",
      "For a business getting even 10 leads a day, hand entry burns hours a week that could go to selling or working.",
      "You do not need a big platform. A lead pipe into one inbox can be built in days and usually pays for itself in the first missed lead it saves.",
    ],
    body: [
      {
        type: "p",
        text: "It feels harmless. A lead comes in by email, you paste the name and number into the spreadsheet, back to work. But do that thirty times a day across email, your website form, Facebook, and missed calls, and it quietly becomes one of the most expensive habits in your business. Here is what it actually costs, and how to make it stop without buying a giant platform.",
      },
      { type: "h2", text: "What hand-copying leads really costs you" },
      {
        type: "p",
        text: "The wasted minutes are the smallest part. The real damage is in three places:",
      },
      {
        type: "ul",
        items: [
          "Speed. Leads that get a reply in five minutes are far more likely to convert than ones that wait an hour. If a lead sits in your inbox until you get around to logging it, a faster competitor is already on the phone with them.",
          "Leaks. When entry is manual, some leads never make it in. A busy day, a missed email, a form notification buried under spam, and that job is simply gone, and you never even knew it existed.",
          "Errors. A mistyped digit in a phone number is a lead you can never reach. A wrong email is a quote that bounces. Hand entry guarantees a steady trickle of these.",
        ],
      },
      {
        type: "callout",
        title: "The hidden math",
        text: "Say each lead takes two minutes to find, copy, clean, and paste, and you get 15 a day. That is 30 minutes a day, about 2.5 hours a week, roughly 130 hours a year of pure re-typing. That is three full work weeks spent being a copy-paste machine, and it does not count the leads that slipped through.",
      },
      { type: "h2", text: "What the fixed version looks like" },
      {
        type: "p",
        text: "The goal is simple: you never copy a lead again. Every source drops into one list automatically, the instant it arrives, already labeled. Concretely:",
      },
      {
        type: "ol",
        items: [
          "Your website form posts straight into your lead list (or CRM), no email round-trip.",
          "Facebook and Instagram lead forms feed the same list automatically.",
          "Missed calls create a lead with the number already filled in, so a callback never gets forgotten.",
          "Every lead is tagged with its source, so you can see which channel is actually worth your money.",
          "A new lead pings your phone, so the clock on your reply speed starts the second it lands, not whenever you next check the sheet.",
        ],
      },
      {
        type: "table",
        caption: "The same Tuesday, two ways.",
        head: ["Moment", "Copying by hand", "Automated pipe"],
        rows: [
          ["Website lead at 9:02", "Sits in email until lunch", "In the list at 9:02, phone buzzes"],
          ["Facebook lead at 11:15", "You forget to check the page", "In the list at 11:15, tagged \"Facebook\""],
          ["Missed call at 2:40", "No record, lost", "Lead created with the number"],
          ["End of day", "You reconstruct the day from memory", "Everything already logged and sourced"],
        ],
      },
      { type: "h2", text: "But my leads come from five different places" },
      {
        type: "p",
        text: "That is exactly the case automation is best at. The reason hand entry feels unavoidable is that the leads are scattered: email here, a form there, DMs, a call. An automation's whole job is to be the funnel that pulls those scattered sources into one clean stream. The more places your leads come from, the more you save by piping them together.",
      },
      {
        type: "callout",
        title: "One inbox, every source",
        text: "This is the same idea behind a fitted CRM: every lead in one place, on any phone, tagged by where it came from. The automation is the plumbing; the CRM is the destination. You can start with just the plumbing.",
      },
      { type: "h2", text: "How it gets built (and what it costs)" },
      {
        type: "p",
        text: "This is one of the fastest, highest-payoff automations there is. It is usually a matter of days, not weeks, because it is plumbing rather than a whole platform. There are two honest paths:",
      },
      {
        type: "ul",
        items: [
          "Off-the-shelf glue (Zapier, Make). Fast to stand up, fine for low volume, but you pay per task every month and it gets expensive and brittle as volume grows.",
          "A small custom pipe. Built once, runs for near-nothing on hosting, does not charge per lead, and can clean and de-duplicate the data as it lands. Better once you have real volume or want it to do more than dumb forwarding.",
        ],
      },
      {
        type: "p",
        text: "Which one is right depends on your volume and whether this is step one toward a real CRM. Either way, the payoff is the same: the first genuinely hot lead it saves from slipping through usually covers the cost.",
      },
      { type: "h2", text: "Do this today, even before you automate" },
      {
        type: "ol",
        items: [
          "Turn on instant notifications for every form and lead source you have, so at least you know the moment one arrives.",
          "Pick one list as the single source of truth and stop keeping leads in three places.",
          "Write down every place a lead can reach you. That list is the exact spec for the automation.",
        ],
      },
    ],
    faqs: [
      {
        q: "How do I get leads into one place without copying them by hand?",
        a: "Connect each lead source directly to one list or CRM so entries arrive automatically. Website forms post straight in, Facebook and Instagram lead forms feed the same list, and missed calls create a lead with the number attached. Each lead gets tagged with its source and pings your phone, so nothing is re-typed and nothing is missed.",
      },
      {
        q: "Is Zapier enough, or do I need custom automation?",
        a: "Zapier or Make is fine to start and quick to set up, but it charges per task every month and gets brittle at higher volume. A small custom pipe is built once, runs for near-nothing, does not charge per lead, and can clean and de-duplicate data as it lands. Choose based on your lead volume and whether this is the first step toward a real CRM.",
      },
      {
        q: "How much time does automating lead entry actually save?",
        a: "At roughly two minutes per lead and 15 leads a day, hand entry burns about 2.5 hours a week, or around 130 hours a year. Automation gives that time back and, more importantly, stops leads from leaking and speeds up your reply time, which is the biggest driver of whether you win the job.",
      },
      {
        q: "How long does it take to set up?",
        a: "This is one of the fastest high-value automations. A lead pipe into one inbox is usually a matter of days, not weeks, because it is plumbing rather than a full platform. It often pays for itself with the first hot lead it keeps from slipping through the cracks.",
      },
    ],
    related: [
      "custom-crm-for-fencing-exterior-contractors",
      "how-many-saas-subscriptions-before-custom-software-is-worth-it",
    ],
    cta: {
      heading: "Stop being your own copy-paste machine.",
      body: "Tell me where your leads come from and I will show you how to pipe every one of them into a single inbox automatically.",
      button: "Automate my leads",
    },
  },
];

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);

export const guidesByCluster = (clusterId: string) =>
  GUIDES.filter((g) => g.clusterId === clusterId);

/** Word count of a guide's prose, used for the reading-time sanity check. */
export function guideWordCount(g: Guide): number {
  let text = g.title + " " + g.description + " " + g.takeaways.join(" ");
  for (const b of g.body) {
    if ("text" in b && b.text) text += " " + b.text;
    if (b.type === "ul" || b.type === "ol") text += " " + b.items.join(" ");
    if (b.type === "table") text += " " + b.head.join(" ") + " " + b.rows.flat().join(" ");
  }
  for (const f of g.faqs) text += " " + f.q + " " + f.a;
  return text.trim().split(/\s+/).length;
}
