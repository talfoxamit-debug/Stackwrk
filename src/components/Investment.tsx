import Reveal from "./Reveal";
import { ArrowRight } from "./icons";
import { investment } from "@/lib/content";

export default function Investment() {
  return (
    <section className="border-y border-lime/30 bg-lime py-10 text-ink sm:py-12">
      <div className="container-content">
        <Reveal className="relative overflow-hidden px-0 py-0">
          {/* Growth-curve backdrop */}
          <svg
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-70 lg:block"
            viewBox="0 0 400 260"
            fill="none"
            preserveAspectRatio="xMaxYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="grow" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#1A0F2E" stopOpacity="0" />
                <stop offset="100%" stopColor="#1A0F2E" />
              </linearGradient>
            </defs>
            {/* grid */}
            <g stroke="#1A0F2E" strokeOpacity="0.16">
              {[...Array(6)].map((_, i) => (
                <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="260" />
              ))}
              {[...Array(5)].map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 60} x2="400" y2="260" />
              ))}
            </g>
            <path d="M0 230 C 90 210, 150 180, 210 140 S 320 40, 392 18" stroke="url(#grow)" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="392" cy="18" r="7" fill="#1A0F2E" className="animate-pulse-glow" />
            <circle cx="392" cy="18" r="14" fill="#1A0F2E" opacity="0.25" className="animate-pulse-glow" />
          </svg>

          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div className="border-ink/20 lg:border-r lg:pr-10">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ink/60">
                {investment.eyebrow}
              </p>
              <h2 className="mt-4 font-display text-3xl uppercase leading-none text-ink sm:text-4xl">
                {investment.headline}
              </h2>
              <p className="mt-1 font-display text-6xl leading-none text-ink sm:text-7xl">
                {investment.price}
              </p>
            </div>

            <div className="lg:pl-8">
              <p className="max-w-sm text-base font-semibold leading-relaxed text-ink/85">
                {investment.sub}
              </p>
              <a href="#about" className="btn-dark mt-6 !rounded-md">
                {investment.cta}
                <ArrowRight width={18} height={18} />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
