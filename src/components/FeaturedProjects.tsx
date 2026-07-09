import Reveal from "./Reveal";
import CardSpotlight from "./CardSpotlight";
import { ArrowRight, Check, TrendUp } from "./icons";
import { projects, type Project } from "@/lib/content";

function BrowserMock({ project }: { project: Project }) {
  const host = (() => {
    try {
      return new URL(project.href).host.replace(/^www\./, "");
    } catch {
      return project.href;
    }
  })();

  return (
    <div className="relative overflow-hidden rounded-md border border-white/10 bg-ink-800 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.9)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-ink-700/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="ml-2 flex h-3.5 flex-1 items-center rounded bg-white/[0.06] px-2 text-[0.55rem] font-medium text-white/40">
          {host}
        </span>
      </div>
      {/* Real screenshot — slow parallax-lift on hover; gradient fallback tint
          behind it while the image loads / if it 404s. */}
      <div className={`relative aspect-[16/11] overflow-hidden bg-gradient-to-br ${project.accent}`}>
        {project.image && (
          /* eslint-disable-next-line @next/next/no-img-element -- static, pre-optimized local screenshot */
          <img
            src={project.image}
            alt={`${project.name} website`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
          />
        )}
        {/* Bottom scrim so the badge stays legible on any screenshot */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded bg-lime px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ink shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          Live project
        </span>
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <section id="work" className="relative border-t border-white/[0.08] py-16 sm:py-24">
      <div className="container-content">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Featured projects</p>
          <h2 className="mt-3 font-display text-4xl uppercase text-white sm:text-5xl">
              Real projects. Real impact.
            </h2>
          </div>
          <a
            href="#work"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-lime transition-colors hover:text-lime-400"
          >
            View all work
            <ArrowRight width={16} height={16} />
          </a>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal
              as="article"
              key={project.name}
              delay={i * 120}
              className="card group relative flex flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-lime/55 hover:shadow-[0_24px_60px_-30px_rgba(203,255,60,0.35)]"
            >
              <CardSpotlight />
              <div className="relative z-[1] flex flex-1 flex-col">
                <BrowserMock project={project} />

                <h3 className="mt-6 flex items-center gap-2 font-display text-2xl uppercase text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-lime/40 text-lime">▱</span>
                  {project.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{project.blurb}</p>

                <p className="mt-4 flex items-start gap-2 rounded-lg border border-lime/20 bg-lime/[0.05] px-3 py-2.5 text-sm text-white/85">
                  <TrendUp width={16} height={16} className="mt-0.5 shrink-0 text-lime" />
                  <span>{project.result}</span>
                </p>

                <ul className="mt-5 space-y-2.5">
                  {project.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/75">
                      <Check width={16} height={16} className="shrink-0 text-lime" />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 border-t border-white/[0.08] pt-5 text-sm font-bold uppercase tracking-wide text-lime transition-transform group-hover:gap-3"
                >
                  View live site
                  <ArrowRight width={16} height={16} />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
