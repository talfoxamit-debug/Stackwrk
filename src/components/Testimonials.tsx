import Reveal from "./Reveal";
import { testimonials } from "@/lib/content";

export default function Testimonials() {
  return (
    <section className="relative border-y border-white/[0.06] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-15" />
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">What clients say</p>
          <h2 className="mt-3 font-display text-4xl uppercase text-white sm:text-5xl">
            Real work. <span className="text-white/45">Real reactions.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="article" key={i} delay={i * 120} className="card flex flex-col p-6">
              <div className="flex gap-0.5 text-lime" aria-hidden="true">
                {"★★★★★".split("").map((s, j) => (
                  <span key={j}>{s}</span>
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-white/80">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <p className="font-display text-sm uppercase tracking-wide text-white">{t.name}</p>
                <p className="text-xs text-white/45">{t.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
