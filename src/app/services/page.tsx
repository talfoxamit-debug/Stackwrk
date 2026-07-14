import type { Metadata } from "next";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CardSpotlight from "@/components/CardSpotlight";
import { ArrowRight } from "@/components/icons";
import { priceItems, money, type PriceItem } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Services | Stackwrk",
  description:
    "Beyond websites: automations, a 24/7 AI assistant, a custom CRM, growth systems, and a fractional CTO on call. The full growth stack for local businesses.",
  alternates: { canonical: "https://stackwrk.com/services" },
};

// What the client gets, grouped for the services page. Care plans live on /pricing.
const GROUPS: { key: PriceItem["category"]; title: string; blurb: string }[] = [
  { key: "build", title: "Websites & Apps", blurb: "Fast, custom sites and full web apps built to turn visitors into booked jobs." },
  { key: "automation", title: "Automations", blurb: "Kill the busywork: quotes, follow-ups, invoicing and reporting, wired together and running on their own." },
  { key: "ai", title: "AI Assistant", blurb: "A 24/7 assistant on your site that answers questions, qualifies leads, and books appointments while you work." },
  { key: "crm", title: "Custom CRM", blurb: "Your process and your data in one place, with no per-seat fees, built around how you actually sell." },
  { key: "growth", title: "Growth Systems", blurb: "Landing pages and conversion tuning that keep turning more of your traffic into revenue." },
  { key: "cto", title: "Fractional CTO", blurb: "An operator-developer in your corner for strategy, vendors, and roadmap, without a full-time hire." },
];

function priceLabel(it: PriceItem): string {
  const parts: string[] = [];
  if (it.founding > 0) parts.push((it.from ? "from " : "") + money(it.founding));
  if (it.monthlyFounding) parts.push(money(it.monthlyFounding) + "/mo");
  return parts.join(" + ") || "Custom quote";
}

export default function ServicesPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden pb-6 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="container-content relative text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Services</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] text-white sm:text-6xl">
              More than a website. <span className="text-accent-glow">The whole stack.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              Most clients start with a website, then grow into the systems that run the business:
              automation, AI, a CRM, and a technical partner who ships. Here&rsquo;s everything we build for you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* service groups */}
      <section className="py-8 sm:py-10">
        <div className="container-content space-y-6">
          {GROUPS.map((g, gi) => {
            const items = priceItems.filter((it) => it.category === g.key);
            if (!items.length) return null;
            return (
              <Reveal as="div" key={g.key} delay={gi * 60} className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6 sm:p-7">
                <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <h2 className="font-display text-2xl uppercase tracking-wide text-white">{g.title}</h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/55 sm:mt-0 sm:text-right">{g.blurb}</p>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {items.map((it) => (
                    <div key={it.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-lime/25">
                      <CardSpotlight />
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-white">{it.label}</h3>
                        <span className="shrink-0 whitespace-nowrap rounded-md border border-lime/25 bg-lime/[0.08] px-2 py-0.5 text-xs font-bold text-lime">{priceLabel(it)}</span>
                      </div>
                      <p className="relative z-10 mt-1.5 text-xs leading-relaxed text-white/55">{it.blurb}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <div className="container-content pb-6 text-center">
        <p className="text-sm text-white/45">
          Looking for website + care-plan pricing?{" "}
          <a href="/pricing" className="text-lime underline-offset-4 hover:underline">See pricing →</a>
        </p>
        <a href="/#audit" className="btn-primary mt-5 !rounded-md">
          Start with a free audit
          <ArrowRight width={16} height={16} />
        </a>
      </div>

      <FinalCTA />
      <Footer />
    </>
  );
}
