"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Target } from "./icons";
import { site } from "@/lib/content";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/**
 * Cost-per-lead calculator (the /tools/cost-per-lead-calculator lead magnet).
 * Values a lead on first-sale revenue only (avg sale x close rate), then
 * derives the maximum sustainable cost per lead from the share of that value
 * the visitor is willing to spend acquiring it. Deliberately conservative: no
 * repeat-business or referral multiplier, so the number reads as a floor.
 */
export default function LeadValueCalculator() {
  const [avgSale, setAvgSale] = useState(4000);
  const [closeRate, setCloseRate] = useState(25);
  const [monthlyLeads, setMonthlyLeads] = useState(30);
  const [marketingPct, setMarketingPct] = useState(20);

  const r = useMemo(() => {
    const leadValue = avgSale * (closeRate / 100);
    const maxCpl = leadValue * (marketingPct / 100);
    const monthlyRevenue = leadValue * monthlyLeads;
    const customersPerMonth = monthlyLeads * (closeRate / 100);
    return {
      leadValue,
      maxCpl,
      monthlyRevenue,
      yearlyRevenue: monthlyRevenue * 12,
      monthlyBudget: maxCpl * monthlyLeads,
      customersPerMonth,
    };
  }, [avgSale, closeRate, monthlyLeads, marketingPct]);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm sm:p-8">
      {/* inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-white">
          Average sale value: <span className="text-lime">{money(avgSale)}</span>
          <input
            type="range" min={200} max={50000} step={100} value={avgSale}
            onChange={(e) => setAvgSale(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            What a typical job or order is worth to you.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          Close rate: <span className="text-lime">{closeRate}%</span>
          <input
            type="range" min={2} max={80} step={1} value={closeRate}
            onChange={(e) => setCloseRate(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Share of leads that become paying customers.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          Leads per month: <span className="text-lime">{monthlyLeads}</span>
          <input
            type="range" min={1} max={300} step={1} value={monthlyLeads}
            onChange={(e) => setMonthlyLeads(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Every enquiry, from every source.
          </span>
        </label>

        <label className="block text-sm font-semibold text-white">
          Spend per lead value: <span className="text-lime">{marketingPct}%</span>
          <input
            type="range" min={5} max={50} step={1} value={marketingPct}
            onChange={(e) => setMarketingPct(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Share of a lead&rsquo;s value you will spend to get it. Often 10 to 30%.
          </span>
        </label>
      </div>

      {/* headline numbers */}
      <div className="mt-7 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/55">One lead is worth</p>
          <p className="mt-1 font-display text-2xl text-white/85">{money(r.leadValue)}</p>
          <p className="text-xs text-white/55">average revenue per enquiry</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">Max cost per lead</p>
          <p className="mt-1 font-display text-2xl text-white">{money(r.maxCpl)}</p>
          <p className="text-xs text-white/50">your break-even ceiling</p>
        </div>
      </div>

      {/* supporting rows */}
      <div className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.015]">
        {[
          ["Customers per month", `${r.customersPerMonth.toFixed(1)}`],
          ["Revenue per month", money(r.monthlyRevenue)],
          ["Revenue per year", money(r.yearlyRevenue)],
          ["Monthly marketing budget this supports", money(r.monthlyBudget)],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-white/60">{label}</span>
            <span className="text-sm font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* verdict */}
      <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-lime/25 bg-lime/[0.04] py-4 text-center">
        <div className="flex items-center gap-2">
          <Target width={18} height={18} className="text-lime" />
          <span className="font-display text-2xl text-lime">Pay up to {money(r.maxCpl)} per lead</span>
        </div>
        <span className="max-w-md text-sm text-white/70">
          Above that and you are buying revenue at a loss. Below it, every extra lead is worth
          buying, so the real question becomes how many you can get.
        </span>
      </div>

      <p className="mt-3 text-center text-[0.78rem] text-white/35">
        Values the first sale only, no repeat business or referrals, so treat this as a floor.
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
          Get more leads worth buying
          <ArrowRight width={18} height={18} />
        </a>
        <a href="/tools/speed-to-lead-calculator" className="btn-ghost !rounded-md">
          What slow replies cost you
        </a>
      </div>
    </div>
  );
}
