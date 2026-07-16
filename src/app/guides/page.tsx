import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import BrushWord from "@/components/BrushWord";
import { ArrowRight } from "@/components/icons";
import { GUIDES, CLUSTERS, guidesByCluster, type Guide } from "@/lib/guides";
import { site } from "@/lib/content";

const BASE = `https://${site.domain}`;

export const metadata: Metadata = {
  title: "Guides: Own the Software That Runs Your Business | Stackwrk",
  description:
    "Straight answers on custom software, automations, CRMs, and lead-generating websites for small businesses: when to build, what it costs, and how to stop renting your operations one subscription at a time.",
  alternates: { canonical: `${BASE}/guides` },
  openGraph: {
    title: "Stackwrk Guides",
    description:
      "When to build custom software, what it costs, and how to automate the busywork. Real answers, real numbers.",
    url: `${BASE}/guides`,
    type: "website",
    siteName: "Stackwrk",
  },
  robots: { index: true, follow: true },
};

const INTENT_LABEL: Record<Guide["intent"], string> = {
  informational: "Guide",
  commercial: "Compare",
  transactional: "Service",
};

function GuideCard({ g }: { g: Guide }) {
  return (
    <Link
      href={`/guides/${g.slug}`}
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-lime/25 hover:bg-white/[0.04] hover:shadow-[0_24px_50px_-34px_rgba(203,255,60,0.5)]"
    >
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <span className="rounded-md border border-lime/25 bg-lime/[0.07] px-2 py-0.5 text-lime">
          {INTENT_LABEL[g.intent]}
        </span>
        <span className="text-white/35">{g.readMins} min</span>
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-white group-hover:text-lime">
        {g.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{g.description}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lime">
        Read the guide
        <ArrowRight width={15} height={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export default function GuidesHub() {
  const latest = GUIDES.slice(0, 3);
  const publishedClusters = CLUSTERS.filter((c) => guidesByCluster(c.id).length > 0);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Stackwrk Guides",
    itemListElement: GUIDES.map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <>
      <JsonLd data={itemListLd} />

      {/* hero */}
      <section className="relative overflow-hidden pb-6 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.12]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.18),transparent_70%)] blur-2xl" />
        <div className="container-content relative z-10 max-w-3xl text-center">
          <Reveal>
            <p className="eyebrow">Guides</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.92] text-white sm:text-6xl">
              Own the software that <BrushWord>runs your business.</BrushWord>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/60">
              Straight answers on when to build custom software, what it really costs,
              and how to automate the busywork, so you save hours and stop renting your
              operations one subscription at a time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* latest */}
      <section className="py-6">
        <div className="container-content">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((g) => (
              <GuideCard key={g.slug} g={g} />
            ))}
          </div>
        </div>
      </section>

      {/* by cluster */}
      <section className="py-6">
        <div className="container-content space-y-10">
          {publishedClusters.map((c) => {
            const items = guidesByCluster(c.id);
            return (
              <div key={c.id}>
                <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                  <h2 className="font-display text-2xl uppercase tracking-wide text-white">
                    {c.name}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/50 sm:mt-0 sm:text-right">
                    {c.blurb}
                  </p>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((g) => (
                    <GuideCard key={g.slug} g={g} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-10">
        <div className="container-content">
          <div className="overflow-hidden rounded-3xl border border-lime/20 bg-gradient-to-br from-lime/[0.08] via-white/[0.02] to-transparent p-8 text-center sm:p-12">
            <h2 className="font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
              Not sure what to build first?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-[0.98rem] leading-relaxed text-white/65">
              That is what the first call is for. Tell me where your week goes and I will
              point you at the one system that would give you the most time back.
            </p>
            <a
              href={site.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 !rounded-md"
            >
              Book a fit call
              <ArrowRight width={16} height={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
