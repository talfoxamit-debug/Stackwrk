import Reveal from "./Reveal";
import { iconMap } from "./icons";
import { whatYouGet } from "@/lib/content";

export default function WhatYouGet() {
  return (
    <section id="process" className="relative scroll-mt-20 py-12 sm:py-16">
      <div className="container-content relative grid gap-10 lg:grid-cols-[0.95fr_2fr] lg:items-center">
        <Reveal>
          <p className="eyebrow">What you get</p>
          <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-white sm:text-5xl">
            {whatYouGet.heading[0]}
            <br />
            <span className="text-white/45">{whatYouGet.heading[1]}</span>
          </h2>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {whatYouGet.items.map((item, i) => {
            const Icon = iconMap[item.icon as keyof typeof iconMap];
            return (
              <Reveal
                key={item.title}
                delay={i * 90}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-lime/30 hover:bg-white/[0.035] hover:shadow-[0_24px_60px_-34px_rgba(203,255,60,0.4)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-lime/40 bg-lime/[0.06] text-lime shadow-glow-lime transition-transform duration-300 group-hover:scale-105">
                  <Icon width={24} height={24} />
                </span>
                <h3 className="mt-4 font-display text-lg uppercase tracking-wide text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{item.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
