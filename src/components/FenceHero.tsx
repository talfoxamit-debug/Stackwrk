import { ArrowRight, Phone, Check } from "./icons";

/**
 * PREVIEW — bright, trust-first hero aimed at fence / exterior contractors.
 * This is the "World A" direction: clear ROI, trust signals, phone-forward,
 * and a mockup of a fence-company site as built-in proof. Self-contained light
 * styling (does not use the site's dark tokens) so it can be previewed in
 * isolation before the theme is rolled out.
 */
export default function FenceHero() {
  const green = "#1C7C54";
  return (
    <section className="relative overflow-hidden bg-white text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-[#EFF6F1] to-white" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 pb-14 pt-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-28">
        {/* Copy */}
        <div>
          <span
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide"
            style={{ color: green, borderColor: `${green}40`, background: `${green}12` }}
          >
            Websites for fence &amp; exterior contractors
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.35rem]">
            More booked jobs from a website that{" "}
            <span style={{ color: green }}>sells your work</span>.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
            Custom sites for fencing &amp; exterior pros — built to turn &ldquo;fence company near
            me&rdquo; searches into quote requests. Live in about 2 weeks, money-back guaranteed.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="tracking-tight text-amber-500">★★★★★</span> Built for contractors</span>
            <span className="flex items-center gap-1.5" style={{ color: green }}><Check width={16} height={16} /> Live in 10 days</span>
            <span className="flex items-center gap-1.5" style={{ color: green }}><Check width={16} height={16} /> Money-back guarantee</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#quote"
              className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-4 text-base font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{ background: green, boxShadow: `0 14px 30px -10px ${green}66` }}
            >
              Get a free mockup of your site <ArrowRight width={18} height={18} />
            </a>
            <a
              href="#work"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              See a live example
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            No cost, no obligation — I&rsquo;ll rebuild your homepage from your own photos and send a
            60-second preview.
          </p>
        </div>

        {/* Proof: a fence-company site mockup */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_70px_-30px_rgba(15,30,46,0.4)]">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="ml-3 rounded border border-slate-100 bg-white px-2 py-0.5 text-[0.6rem] text-slate-400">powerfencefl.com</span>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm font-extrabold text-slate-900">POWER<span style={{ color: green }}>FENCE</span></span>
              <span className="flex items-center gap-1 rounded-md px-2.5 py-1 text-[0.62rem] font-bold text-white" style={{ background: green }}>
                <Phone width={10} height={10} /> (954) 555-0140
              </span>
            </div>

            <div
              className="relative h-56 sm:h-64"
              style={{ backgroundImage: "repeating-linear-gradient(90deg,#b5794a,#b5794a 22px,#a86e42 22px,#a86e42 25px)" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="mb-1.5 text-xs text-amber-300">★★★★★ <span className="text-white/80">5.0 · 214 reviews</span></div>
                <p className="text-xl font-extrabold leading-tight text-white sm:text-2xl">Quality Fences,<br />Built to Last.</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="rounded-md px-3 py-1.5 text-[0.68rem] font-bold text-white" style={{ background: green }}>Get a Free Quote →</span>
                  <span className="rounded-md bg-white/90 px-3 py-1.5 text-[0.68rem] font-bold text-slate-800">Our Work</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 px-4 py-3 text-center">
              {["Licensed & Insured", "Free Estimates", "20+ Yrs Experience"].map((t) => (
                <div key={t} className="rounded-lg border border-slate-100 bg-slate-50 px-1 py-2 text-[0.6rem] font-semibold text-slate-600">{t}</div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full text-white" style={{ background: green }}><Check width={14} height={14} /></span>
            <div className="leading-tight">
              <p className="text-[0.7rem] font-bold text-slate-900">New quote request</p>
              <p className="text-[0.6rem] text-slate-500">Vinyl fence · Fort Lauderdale</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400 sm:px-8">
          Trusted by contractors across South Florida
        </div>
      </div>
    </section>
  );
}
