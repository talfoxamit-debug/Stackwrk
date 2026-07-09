import Reveal from "./Reveal";
import { Check } from "./icons";
import { guarantee } from "@/lib/content";

export default function Guarantee() {
  return (
    <section className="py-8 sm:py-12">
      <div className="container-content">
        <Reveal className="relative overflow-hidden rounded-2xl border border-lime/25 bg-lime/[0.04] p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-lime/10 blur-[80px]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-lime">{guarantee.eyebrow}</p>
              <h2 className="mt-3 font-display text-3xl uppercase leading-tight text-white sm:text-4xl">
                {guarantee.heading}
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70">{guarantee.body}</p>
            </div>
            <ul className="space-y-3">
              {guarantee.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm font-medium text-white/85">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-ink">
                    <Check width={14} height={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
