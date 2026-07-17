import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { ArrowRight, Check } from "@/components/icons";
import {
  GUIDES,
  guideBySlug,
  clusterById,
  type Guide,
  type GuideBlock,
} from "@/lib/guides";
import { site } from "@/lib/content";

const BASE = `https://${site.domain}`;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const g = guideBySlug((await params).slug);
  if (!g) return { title: "Guide not found | Stackwrk" };
  const title = g.metaTitle ?? g.title;
  const url = `${BASE}/guides/${g.slug}`;
  return {
    title: `${title} | Stackwrk`,
    description: g.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: g.description,
      url,
      type: "article",
      siteName: "Stackwrk",
    },
    twitter: { card: "summary_large_image", title, description: g.description },
    robots: { index: true, follow: true },
  };
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const INTENT_LABEL: Record<Guide["intent"], string> = {
  informational: "Guide",
  commercial: "Compare",
  transactional: "Service",
};

/** Renders one content block on the dark theme. */
function Block({ b }: { b: GuideBlock }) {
  switch (b.type) {
    case "h2":
      return (
        <h2 className="mt-12 font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
          {b.text}
        </h2>
      );
    case "h3":
      return <h3 className="mt-8 text-lg font-bold text-white">{b.text}</h3>;
    case "p":
      return <p className="mt-5 text-[1.02rem] leading-relaxed text-white/70">{b.text}</p>;
    case "ul":
      return (
        <ul className="mt-5 space-y-3">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3 text-[1.02rem] leading-relaxed text-white/70">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" />
              {it}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="mt-5 space-y-3">
          {b.items.map((it, i) => (
            <li key={it} className="flex gap-3 text-[1.02rem] leading-relaxed text-white/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-lime/40 bg-lime/[0.08] text-xs font-bold text-lime">
                {i + 1}
              </span>
              {it}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <div className="mt-7 rounded-2xl border border-lime/25 bg-lime/[0.05] p-5 sm:p-6">
          {b.title && (
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-lime">
              <Check width={15} height={15} /> {b.title}
            </p>
          )}
          <p className="mt-2 text-[1.02rem] leading-relaxed text-white/80">{b.text}</p>
        </div>
      );
    case "quote":
      return (
        <blockquote className="mt-7 border-l-2 border-lime/50 pl-5 text-lg italic leading-relaxed text-white/80">
          {b.text}
          {b.cite && <cite className="mt-2 block text-sm not-italic text-white/55">{b.cite}</cite>}
        </blockquote>
      );
    case "table":
      return (
        <figure className="mt-7">
          <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-white/[0.04]">
                  {b.head.map((h) => (
                    <th
                      key={h}
                      className="border-b border-white/[0.08] px-4 py-3 font-bold text-white"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, ri) => (
                  <tr key={ri} className="odd:bg-white/[0.015]">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border-b border-white/[0.05] px-4 py-3 align-top leading-relaxed ${
                          ci === 0 ? "font-semibold text-white/90" : "text-white/65"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.caption && (
            <figcaption className="mt-2 px-1 text-xs text-white/55">{b.caption}</figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

export default async function GuideArticle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();

  const cluster = clusterById(g.clusterId);
  const url = `${BASE}/guides/${g.slug}`;
  const related = g.related.map(guideBySlug).filter(Boolean) as Guide[];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.metaTitle ?? g.title,
    description: g.description,
    datePublished: g.date,
    dateModified: g.updated ?? g.date,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Stackwrk", url: BASE },
    publisher: {
      "@type": "Organization",
      name: "Stackwrk",
      url: BASE,
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: g.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
      { "@type": "ListItem", position: 3, name: g.title, item: url },
    ],
  };

  return (
    <>
      <JsonLd data={[articleLd, faqLd, breadcrumbLd]} />

      <article className="relative overflow-hidden pb-4 pt-24 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.08]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.16),transparent_70%)] blur-2xl" />

        <div className="container-content relative z-10 max-w-3xl">
          {/* breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-white/55" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-lime">Home</Link>
            <span>/</span>
            <Link href="/guides" className="hover:text-lime">Guides</Link>
            <span>/</span>
            <span className="text-white/60">{cluster?.name ?? "Guide"}</span>
          </nav>

          <p className="eyebrow mt-6">{cluster?.name ?? "Guide"}</p>
          <h1 className="mt-3 font-display text-4xl uppercase leading-[0.98] text-white sm:text-5xl">
            {g.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
            <span className="rounded-md border border-lime/25 bg-lime/[0.07] px-2 py-0.5 text-xs font-bold text-lime">
              {INTENT_LABEL[g.intent]}
            </span>
            <span>Updated {fmtDate(g.updated ?? g.date)}</span>
            <span aria-hidden="true">·</span>
            <span>{g.readMins} min read</span>
          </p>

          {/* quick-answer takeaways */}
          <div className="mt-8 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">The short answer</p>
            <ul className="mt-4 space-y-3">
              {g.takeaways.map((t) => (
                <li key={t} className="flex gap-3 text-[0.98rem] leading-relaxed text-white/80">
                  <Check width={16} height={16} className="mt-1 shrink-0 text-lime" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* body */}
          <div className="mt-6">
            {g.body.map((b, i) => (
              <Block key={i} b={b} />
            ))}
          </div>

          {/* FAQ */}
          {g.faqs.length > 0 && (
            <section className="mt-14">
              <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
                Common questions
              </h2>
              <div className="mt-6 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                {g.faqs.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.02rem] font-semibold text-white">
                      {f.q}
                      <span className="shrink-0 text-lime transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-white/65">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-lime/20 bg-gradient-to-br from-lime/[0.08] via-white/[0.02] to-transparent p-8 text-center sm:p-10">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white sm:text-3xl">
              {g.cta?.heading ?? "Let's build the thing that saves you the hours."}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[0.98rem] leading-relaxed text-white/65">
              {g.cta?.body ??
                "Tell me what is eating your week and I will show you what a custom fix looks like. No cost, no pressure."}
            </p>
            <a
              href={site.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6 !rounded-md"
            >
              {g.cta?.button ?? "Book a fit call"}
              <ArrowRight width={16} height={16} />
            </a>
          </div>

          {/* byline for E-E-A-T */}
          <p className="mt-10 text-sm text-white/55">
            Written by Tal, founder of Stackwrk. I build custom software, automations,
            CRMs, and lead-generating sites for small and mid-size businesses.
          </p>

          {/* related */}
          {related.length > 0 && (
            <section className="mt-12 border-t border-white/[0.07] pt-8">
              <p className="eyebrow">Keep reading</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/guides/${r.slug}`}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime/25 hover:bg-white/[0.04]"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-lime/80">
                      {clusterById(r.clusterId)?.name}
                    </p>
                    <p className="mt-2 font-semibold leading-snug text-white group-hover:text-lime">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-10">
            <Link
              href="/guides"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 hover:text-lime"
            >
              ← All guides
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
}
