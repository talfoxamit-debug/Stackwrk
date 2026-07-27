"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Bolt } from "./icons";
import { site } from "@/lib/content";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

/** Discrete response-time steps, so the slider spans minutes to days sensibly. */
const RESPONSE_STEPS = [
  { mins: 5, label: "Under 5 min" },
  { mins: 15, label: "15 minutes" },
  { mins: 30, label: "30 minutes" },
  { mins: 60, label: "1 hour" },
  { mins: 120, label: "2 hours" },
  { mins: 240, label: "4 hours" },
  { mins: 480, label: "8 hours" },
  { mins: 1440, label: "Next day" },
  { mins: 2880, label: "2 days or more" },
];

/**
 * Speed-to-lead calculator (/tools/speed-to-lead-calculator).
 *
 * Deliberately does NOT assert a specific industry statistic. The conversion
 * uplift from replying fast is an assumption the visitor sets themselves
 * (conservative 1.5x default), because the honest claim is directional ("the
 * first responder tends to win"), not a precise multiplier we can stand
 * behind. The tool's job is to show the scale of the problem with the
 * visitor's own numbers, and the uplift is labelled as an assumption on-screen.
 */
export default function SpeedToLeadCalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState(30);
  const [avgSale, setAvgSale] = useState(4000);
  const [closeRate, setCloseRate] = useState(20);
  const [stepIdx, setStepIdx] = useState(5); // default: 4 hours
  const [uplift, setUplift] = useState(1.5);

  const step = RESPONSE_STEPS[stepIdx];
  const alreadyFast = step.mins <= 5;

  const r = useMemo(() => {
    const nowDeals = monthlyLeads * (closeRate / 100);
    // Cap the improved rate so the model never implies closing more than
    // nine in ten leads, which no real business does.
    const fastRate = Math.min(closeRate * uplift, 90);
    const fastDeals = monthlyLeads * (fastRate / 100);
    const extraDeals = Math.max(0, fastDeals - nowDeals);
    const monthlyLoss = extraDeals * avgSale;
    return {
      nowDeals,
      fastDeals,
      fastRate,
      extraDeals,
      monthlyLoss,
      yearlyLoss: monthlyLoss * 12,
      nowRevenue: nowDeals * avgSale,
    };
  }, [monthlyLeads, avgSale, closeRate, uplift]);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm sm:p-8">
      {/* inputs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-white">
          Leads per month: <span className="text-lime">{monthlyLeads}</span>
          <input
            type="range" min={1} max={300} step={1} value={monthlyLeads}
            onChange={(e) => setMonthlyLeads(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>

        <label className="block text-sm font-semibold text-white">
          Average sale value: <span className="text-lime">{money(avgSale)}</span>
          <input
            type="range" min={200} max={50000} step={100} value={avgSale}
            onChange={(e) => setAvgSale(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>

        <label className="block text-sm font-semibold text-white">
          Close rate today: <span className="text-lime">{closeRate}%</span>
          <input
            type="range" min={2} max={70} step={1} value={closeRate}
            onChange={(e) => setCloseRate(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>

        <label className="block text-sm font-semibold text-white">
          Typical reply time: <span className="text-lime">{step.label}</span>
          <input
            type="range" min={0} max={RESPONSE_STEPS.length - 1} step={1} value={stepIdx}
            onChange={(e) => setStepIdx(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
          <span className="mt-1 block text-xs font-normal text-white/55">
            Be honest: nights and weekends count too.
          </span>
        </label>
      </div>

      {/* the assumption, surfaced rather than hidden */}
      <div className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
        <label className="block text-sm font-semibold text-white">
          Assumed lift from replying within 5 minutes:{" "}
          <span className="text-lime">{uplift.toFixed(2)}x</span>
          <input
            type="range" min={1} max={3} step={0.05} value={uplift}
            onChange={(e) => setUplift(Number(e.target.value))}
            className="mt-2 w-full accent-lime"
          />
        </label>
        <p className="mt-1 text-xs text-white/55">
          This is your assumption, not our claim. The default is conservative. Whoever replies
          first tends to win the job, but the exact multiplier depends on your market, so set it
          to whatever you actually believe and read the result accordingly.
        </p>
      </div>

      {alreadyFast ? (
        <div className="mt-6 flex flex-col items-center gap-1 rounded-xl border border-lime/25 bg-lime/[0.04] py-5 text-center">
          <div className="flex items-center gap-2">
            <Bolt width={18} height={18} className="text-lime" />
            <span className="font-display text-2xl text-lime">You are already fast</span>
          </div>
          <span className="max-w-md text-sm text-white/70">
            Replying inside five minutes puts you ahead of most competitors. The next gain is
            making sure it happens every time, including nights and weekends, not just when you
            are at your desk.
          </span>
        </div>
      ) : (
        <>
          {/* now vs fast */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
              <p className="text-[0.75rem] uppercase tracking-widest text-white/55">
                Replying in {step.label.toLowerCase()}
              </p>
              <p className="mt-1 font-display text-2xl text-white/80">{r.nowDeals.toFixed(1)}</p>
              <p className="text-xs text-white/55">jobs/mo at {closeRate}%</p>
            </div>
            <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
              <p className="text-[0.75rem] uppercase tracking-widest text-lime">Replying in 5 min</p>
              <p className="mt-1 font-display text-2xl text-white">{r.fastDeals.toFixed(1)}</p>
              <p className="text-xs text-white/50">jobs/mo at {r.fastRate.toFixed(0)}%</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.015]">
            {[
              ["Extra jobs per month", r.extraDeals.toFixed(1)],
              ["Revenue left on the table monthly", money(r.monthlyLoss)],
              ["Over a year", money(r.yearlyLoss)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-white/60">{label}</span>
                <span className="text-sm font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col items-center gap-1 rounded-xl border border-lime/25 bg-lime/[0.04] py-4 text-center">
            <div className="flex items-center gap-2">
              <Bolt width={18} height={18} className="text-lime" />
              <span className="font-display text-2xl text-lime">
                {money(r.yearlyLoss)} a year
              </span>
            </div>
            <span className="max-w-md text-sm text-white/70">
              That is the gap between replying in {step.label.toLowerCase()} and replying in five
              minutes, on leads you already generate and already pay for.
            </span>
          </div>
        </>
      )}

      <p className="mt-3 text-center text-[0.78rem] text-white/35">
        An estimate built on your own numbers and your own uplift assumption, not a forecast.
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !rounded-md">
          Fix my follow-up
          <ArrowRight width={18} height={18} />
        </a>
        <a href="/guides/every-lead-source-in-one-inbox" className="btn-ghost !rounded-md">
          How one lead inbox works
        </a>
      </div>
    </div>
  );
}
