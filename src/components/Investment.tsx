import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { ArrowRight } from "./icons";
import { investment } from "@/lib/content";

export default function Investment() {
  return (
    <section className="py-5 sm:py-7">
      <div className="container-content">
        <Reveal className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-800/25 via-[#0b0616] to-[#0b0616] px-7 py-8 sm:px-10 sm:py-9">
          {/* restrained glow + a subtle upward growth line on the right */}
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.4),transparent_70%)] blur-2xl" />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 lg:block"
            style={{
              maskImage: "linear-gradient(to right, transparent, #000 50%)",
              WebkitMaskImage: "linear-gradient(to right, transparent, #000 50%)",
            }}
          >
            <svg viewBox="0 0 400 200" preserveAspectRatio="xMaxYMid slice" fill="none" className="h-full w-full">
              <defs>
                <linearGradient id="invline" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#CBFF3C" stopOpacity="0" />
                  <stop offset="100%" stopColor="#CBFF3C" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M0 176 C 92 160, 150 128, 214 92 S 322 24, 392 12" stroke="url(#invline)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="392" cy="12" r="4" fill="#CBFF3C" className="animate-pulse-glow" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-lime/80">
                {investment.eyebrow}
              </p>
              <p className="mt-2 font-display text-2xl uppercase leading-none text-white/85 sm:text-3xl">
                {investment.headline}
              </p>
              <CountUp
                value={2000}
                prefix="$"
                className="mt-1 block font-display text-6xl leading-none text-accent-glow sm:text-7xl"
              />
              <p className="mt-3 max-w-sm text-sm text-white/55">{investment.sub}</p>
            </div>
            <a href="#about" className="btn-primary shrink-0 !rounded-md">
              {investment.cta}
              <ArrowRight width={18} height={18} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
