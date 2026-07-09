import Reveal from "./Reveal";
import { Check } from "./icons";
import { guarantee } from "@/lib/content";

export default function Guarantee() {
  return (
    <section className="pb-4 pt-10 sm:pb-6 sm:pt-12">
      <div className="container-content">
        <Reveal className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 backdrop-blur-sm sm:p-9">
          <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(203,255,60,0.14),transparent_70%)] blur-2xl" />
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
