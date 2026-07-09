import DemoShowcase from "./DemoShowcase";
import Reveal from "./Reveal";

export default function DemoSection() {
  return (
    <section id="demos" className="relative overflow-hidden py-16 sm:py-24">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-violet-600/15 blur-[90px]" />
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">See what I can build</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            Not just websites. <span className="text-accent-glow">Tools that sell.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Real, interactive features I build into client sites — booking, calculators, AI chat, redesigns.
            Try them right here.
          </p>
        </Reveal>

        <div className="mt-10">
          <DemoShowcase />
        </div>
      </div>
    </section>
  );
}
