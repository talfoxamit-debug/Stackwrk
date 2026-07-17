"use client";

import { useMemo, useState } from "react";
import { ArrowRight, TrendUp } from "./icons";
import { site } from "@/lib/content";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const HOSTING_PER_MONTH = 30; // flat cloud hosting for an owned custom system

/**
 * SaaS vs custom software cost calculator (the /tools/saas-vs-custom-calculator
 * lead magnet). Projects the visitor's monthly subscription spend forward with
 * yearly growth and compares the running total against a one-time build plus
 * flat hosting. Reports the break-even month and is honest when renting wins.
 */
export default function SaasVsCustomCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(420);
  const [growthPct, setGrowthPct] = useState(12);
  const [buildCost, setBuildCost] = useState(15000);
  const [years, setYears] = useState(5);

  const result = useMemo(() => {
    const months = years * 12;
    const monthlyGrowth = Math.pow(1 + growthPct / 100, 1 / 12);
    let saasCum = 0;
    let spend = monthlySpend;
    let breakevenMonth: number | null = null;
    for (let m = 1; m <= months; m++) {
      saasCum += spend;
      const customCum = buildCost + HOSTING_PER_MONTH * m;
      if (breakevenMonth === null && customCum <= saasCum) breakevenMonth = m;
      spend *= monthlyGrowth;
    }
    const customTotal = buildCost + HOSTING_PER_MONTH * months;
    const savings = saasCum - customTotal;
    return { months, saasTotal: saasCum, customTotal, savings, breakevenMonth };
  }, [monthlySpend, growthPct, buildCost, years]);

  const owningWins = result.savings > 0;
  // Bar widths relative to the larger of the two totals.
  const maxTotal = Math.max(result.saasTotal, result.customTotal, 1);
  const saasW = (result.saasTotal / maxTotal) * 100;
  const customW = (result.customTotal / maxTotal) * 100;

  const breakevenLabel = () => {
    if (result.breakevenMonth === null) {
      return `Does not break even within ${years} years at these numbers.`;
    }
    const m = result.breakevenMonth;
    const y = Math.floor((m - 1) / 12) + 1;
    return `Custom pays for itself around month ${m} (year ${y}).`;
  };

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm sm:p-8">
      {/* inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-white">
          Monthly software spend: <span className="text-lime">{money(monthlySpend)}</span>
          <input
            type="range" min={50} max={3000} step={10} value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Only the tools one custom system could replace, counting every seat.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          Yearly cost growth: <span className="text-lime">{growthPct}%</span>
          <input
            type="range" min={0} max={30} step={1} value={growthPct}
            onChange={(e) => setGrowthPct(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Seat growth plus price increases. Often 10 to 15%.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          One-time build cost: <span className="text-lime">{money(buildCost)}</span>
          <input
            type="range" min={4000} max={60000} step={1000} value={buildCost}
            onChange={(e) => setBuildCost(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Estimate. Plus ~{money(HOSTING_PER_MONTH)}/mo hosting, built in.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          Time horizon: <span className="text-lime">{years} years</span>
          <input
            type="range" min={1} max={7} step={1} value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            How long you will actually run this system.
          </span>
        </label>
      </div>

      {/* totals */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/55">Keep renting (SaaS)</p>
          <p className="mt-1 font-display text-2xl text-white/80">{money(result.saasTotal)}</p>
          <p className="text-xs text-white/55">total over {years} years</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">Own it (custom)</p>
          <p className="mt-1 font-display text-2xl text-white">{money(result.customTotal)}</p>
          <p className="text-xs text-white/50">build + {money(HOSTING_PER_MONTH)}/mo hosting</p>
        </div>
      </div>

      {/* comparison bars */}
      <div className="mt-5 space-y-2.5">
        <div>
          <div className="mb-1 flex justify-between text-xs text-white/55">
            <span>SaaS</span><span>{money(result.saasTotal)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-white/25" style={{ width: `${saasW}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-white/55">
            <span>Custom</span><span>{money(result.customTotal)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-lime" style={{ width: `${customW}%` }} />
          </div>
        </div>
      </div>

      {/* verdict */}
      <div
        className={`mt-5 flex flex-col items-center gap-1 rounded-xl border py-4 text-center ${
          owningWins ? "border-lime/25 bg-lime/[0.04]" : "border-white/15 bg-white/[0.03]"
        }`}
      >
        {owningWins ? (
          <>
            <div className="flex items-center gap-2">
              <TrendUp width={18} height={18} className="text-lime" />
              <span className="font-display text-2xl text-lime">Own it: save {money(result.savings)}</span>
            </div>
            <span className="text-sm text-white/70">
              over {years} years versus renting. {breakevenLabel()}
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-xl text-white">Keep renting for now</span>
            <span className="max-w-md text-sm text-white/60">
              At these numbers, subscriptions cost {money(-result.savings)} less over {years} years.
              Building is not worth it yet. Revisit as your spend or team grows.
            </span>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-[0.78rem] text-white/35">
        Honest estimate, not a quote. Real build cost depends on scope; real SaaS cost depends on your tools.
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
          Get a real build estimate
          <ArrowRight width={18} height={18} />
        </a>
        <a href="/guides/how-many-saas-subscriptions-before-custom-software-is-worth-it" className="btn-ghost !rounded-md">
          Read the full math
        </a>
      </div>
    </div>
  );
}
