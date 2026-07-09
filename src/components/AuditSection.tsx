import AuditTool from "./AuditTool";
import Reveal from "./Reveal";

export default function AuditSection() {
  return (
    <section id="audit" className="relative overflow-hidden border-t border-white/[0.08] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-20" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-lime/10 blur-[90px]" />
      <div className="container-content relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Free instant audit</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            How does your site <span className="text-accent-glow">really</span> perform?
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-white/60">
            Drop in your website and get an instant, no-nonsense scorecard — speed, mobile,
            SEO and the conversion gaps quietly costing you customers.
          </p>
        </Reveal>

        <div className="mt-10">
          <AuditTool />
        </div>
      </div>
    </section>
  );
}
