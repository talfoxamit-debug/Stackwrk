import Reveal from "./Reveal";
import { howItWorks } from "@/lib/content";

export default function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 py-12 sm:py-16">
      <div className="container-content">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{howItWorks.eyebrow}</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            {howItWorks.heading[0]}
            <br />
            <span className="text-white/45">{howItWorks.heading[1]}</span>
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {howItWorks.steps.map((s, i) => (
            <Reveal
              as="div"
              key={s.n}
              delay={i * 120}
              className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-colors hover:border-lime/30"
            >
              <span className="font-display text-5xl leading-none text-lime/30">{s.n}</span>
              <h3 className="mt-4 font-display text-xl uppercase tracking-wide text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
