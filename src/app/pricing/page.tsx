import type { Metadata } from "next";
import Plans from "@/components/Plans";
import Faq from "@/components/Faq";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import CardSpotlight from "@/components/CardSpotlight";
import { ArrowRight, Check } from "@/components/icons";
import { PLAN_PRESETS } from "@/lib/agreement";

export const metadata: Metadata = {
  title: "Pricing | Stackwrk",
  description:
    "Fixed, honest pricing for fence & exterior contractor websites. Build tiers from $2,000, plus care plans that keep your site fast, secure, and improving.",
  alternates: { canonical: "https://stackwrk.com/pricing" },
};

const money = (n: number) => "$" + n.toLocaleString("en-US");

const tiers = [
  {
    key: "Launch" as const,
    tagline: "A clean, fast site that gets you found and booked.",
    includes: [
      "5 pages, mobile-first custom design",
      "Instant quote form + click-to-call",
      "Google Business Profile setup help",
      "On-page SEO basics + analytics",
      "Live in about 2 weeks",
    ],
  },
  {
    key: "Growth" as const,
    tagline: "The site most contractors need, with tools that sell.",
    highlight: true,
    includes: [
      "Everything in Launch, plus:",
      "8 pages incl. service-area + financing",
      "Instant quote / estimate tool",
      "Reviews, warranty & trust sections",
      "Priority build + 1 extra revision round",
    ],
  },
  {
    key: "Market Leader" as const,
    tagline: "Own your market with the full lead-gen system.",
    includes: [
      "Everything in Growth, plus:",
      "12 pages + multiple service-area pages",
      "Custom tools (calculators, portals)",
      "Advanced SEO + schema markup",
      "AI assistant option to book 24/7",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden pb-6 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-lime/[0.06] blur-[100px]" />
        <div className="container-content relative text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Pricing</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.95] text-white sm:text-6xl">
              Fixed prices. <span className="text-accent-glow">No surprises.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-white/60">
              You see the full price before you start. Build once, then a care plan keeps
              your site fast, secure, and bringing in jobs every month.
            </p>
          </Reveal>
        </div>
      </section>

      {/* build tiers */}
      <section className="py-10 sm:py-12">
        <div className="container-content">
          <div className="grid gap-5 md:grid-cols-3">
            {tiers.map((t, i) => {
              const p = PLAN_PRESETS[t.key];
              return (
                <Reveal as="div" key={t.key} delay={i * 100} className="relative">
                  {t.highlight && (
                    <span className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-lime px-3 py-1 text-[0.75rem] font-bold uppercase tracking-widest text-ink shadow-lg">
                      Most popular
                    </span>
                  )}
                  <article className={`card group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-lime/40 ${t.highlight ? "border-lime/35 shadow-[0_0_50px_-24px_rgba(203,255,60,0.45)]" : ""}`}>
                    <CardSpotlight />
                    <h2 className="relative z-10 font-display text-xl uppercase tracking-wide text-white">{t.key}</h2>
                    <p className="relative z-10 mt-1 text-sm text-white/50">{t.tagline}</p>
                    <p className="relative z-10 mt-5 flex items-baseline gap-2">
                      <span className="font-display text-5xl text-white">{money(p.fee)}</span>
                      <span className="text-sm text-white/40 line-through">{money(p.listFee)}</span>
                    </p>
                    <p className="relative z-10 mt-1 text-xs font-semibold uppercase tracking-wide text-lime">Founding-client rate</p>
                    <ul className="relative z-10 mt-5 flex-1 space-y-2.5">
                      {t.includes.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                          <Check width={15} height={15} className="mt-0.5 shrink-0 text-lime" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <p className="relative z-10 mt-5 border-t border-white/10 pt-4 text-xs text-white/50">
                      Pairs with the <span className="text-white/80">{p.careName}</span> care plan ({money(p.careMonthly)}/mo).
                    </p>
                    <a href="/#audit" className={`${t.highlight ? "btn-primary" : "btn-ghost"} relative z-10 mt-5 w-full !rounded-md`}>
                      Start with a free audit
                      <ArrowRight width={16} height={16} />
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-white/45">
            Every build includes a refundable deposit, a love-the-design guarantee, and 100% ownership of your site.
          </p>
        </div>
      </section>

      {/* care plans (recurring) */}
      <Plans />

      {/* FAQ + CTA */}
      <Faq />
      <FinalCTA />
      <Footer />
    </>
  );
}
