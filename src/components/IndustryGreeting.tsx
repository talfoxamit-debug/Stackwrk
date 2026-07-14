"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "./icons";

/**
 * Cold-email personalization. When a campaign link includes ?for=dentists (or
 * ?industry=), this strip greets the visitor by their industry so the landing
 * feels made for them. Renders nothing (no layout shift) without the param.
 */
export default function IndustryGreeting() {
  const [industry, setIndustry] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forWho = params.get("for") || params.get("industry");
    if (forWho) {
      const clean = forWho.replace(/[^a-z0-9 &'-]/gi, "").trim().slice(0, 30);
      if (clean) setIndustry(clean);
    }
  }, []);

  if (!industry || dismissed) return null;

  return (
    <section className="border-b border-lime/20 bg-lime/[0.06]">
      <div className="container-content flex items-center gap-3 py-3">
        <Sparkles width={18} height={18} className="hidden shrink-0 text-lime sm:block" />
        <p className="flex-1 text-sm leading-snug text-white/90">
          Got our note about your <span className="font-semibold capitalize text-lime">{industry}</span>{" "}
          website? This is a taste of what we&rsquo;d build for you.
        </p>
        <a
          href="#audit"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-lime hover:text-lime-400 sm:inline-flex"
        >
          See your audit
          <ArrowRight width={15} height={15} />
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 rounded-md px-2 py-1 text-white/40 transition-colors hover:text-white"
        >
          ✕
        </button>
      </div>
    </section>
  );
}
