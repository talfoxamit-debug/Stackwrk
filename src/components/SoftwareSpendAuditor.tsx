"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowRight, TrendUp } from "./icons";
import { site } from "@/lib/content";

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

type Row = { id: number; name: string; cost: number; seats: number };

/** Realistic starting rows so the tool shows its value before any typing. */
const STARTER_ROWS: Omit<Row, "id">[] = [
  { name: "CRM", cost: 79, seats: 3 },
  { name: "Accounting", cost: 60, seats: 1 },
  { name: "Scheduling / jobs", cost: 49, seats: 3 },
  { name: "Email marketing", cost: 39, seats: 1 },
  { name: "Storage & docs", cost: 18, seats: 3 },
];

/**
 * Software spend auditor (/tools/software-spend-auditor). A list builder rather
 * than sliders: the whole insight is that a software bill feels small because it
 * arrives in a dozen pieces, so seeing them stacked in one column is the point.
 * Projects forward with a yearly increase because a multi-year total at today's
 * prices would understate what the visitor actually pays.
 */
export default function SoftwareSpendAuditor() {
  const nextId = useRef(STARTER_ROWS.length);
  const [rows, setRows] = useState<Row[]>(
    STARTER_ROWS.map((r, i) => ({ ...r, id: i })),
  );
  const [growthPct, setGrowthPct] = useState(8);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [...rs, { id: nextId.current++, name: "", cost: 40, seats: 1 }]);

  const r = useMemo(() => {
    const monthly = rows.reduce(
      (sum, row) => sum + Math.max(0, row.cost) * Math.max(1, row.seats),
      0,
    );
    const yearly = monthly * 12;
    // Compound the yearly bill forward: year 1 at today's prices, each later
    // year uplifted by growthPct.
    const project = (years: number) => {
      let total = 0;
      for (let y = 0; y < years; y++) total += yearly * Math.pow(1 + growthPct / 100, y);
      return total;
    };
    return {
      monthly,
      yearly,
      threeYear: project(3),
      fiveYear: project(5),
      perSeatShare: rows.reduce(
        (sum, row) => sum + (row.seats > 1 ? Math.max(0, row.cost) * Math.max(1, row.seats) : 0),
        0,
      ),
    };
  }, [rows, growthPct]);

  const field =
    "rounded-lg border border-white/10 bg-ink-800/70 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.5)] backdrop-blur-sm sm:p-8">
      {/* header row */}
      <div className="hidden grid-cols-[1fr_5.5rem_4.5rem_2rem] gap-2 px-1 pb-2 text-[0.7rem] uppercase tracking-widest text-white/45 sm:grid">
        <span>Tool</span>
        <span>$ / month</span>
        <span>Seats</span>
        <span />
      </div>

      {/* rows */}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1fr_5.5rem_4.5rem_2rem] gap-2">
            <input
              value={row.name}
              onChange={(e) => update(row.id, { name: e.target.value })}
              placeholder="Tool name"
              aria-label="Tool name"
              className={field}
            />
            <input
              type="number" min={0} value={row.cost}
              onChange={(e) => update(row.id, { cost: Number(e.target.value) })}
              aria-label={`${row.name || "Tool"} monthly cost`}
              className={field}
            />
            <input
              type="number" min={1} value={row.seats}
              onChange={(e) => update(row.id, { seats: Number(e.target.value) })}
              aria-label={`${row.name || "Tool"} seats`}
              className={field}
            />
            <button
              onClick={() => remove(row.id)}
              aria-label={`Remove ${row.name || "tool"}`}
              className="rounded-lg text-white/35 transition-colors hover:bg-white/5 hover:text-rose-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        className="mt-3 w-full rounded-lg border border-dashed border-white/15 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:border-lime/40 hover:text-lime"
      >
        + Add another subscription
      </button>

      {/* growth assumption */}
      <label className="mt-6 block text-sm font-semibold text-white">
        Yearly price increase: <span className="text-lime">{growthPct}%</span>
        <input
          type="range" min={0} max={25} step={1} value={growthPct}
          onChange={(e) => setGrowthPct(Number(e.target.value))}
          className="mt-2 w-full accent-lime"
        />
        <span className="mt-1 block text-xs font-normal text-white/55">
          Price rises plus tier changes. Set to 0% to see today&rsquo;s prices held flat.
        </span>
      </label>

      {/* totals */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-white/55">Per month</p>
          <p className="mt-1 font-display text-2xl text-white/85">{money(r.monthly)}</p>
          <p className="text-xs text-white/55">{rows.length} subscriptions</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.75rem] uppercase tracking-widest text-lime">Next 5 years</p>
          <p className="mt-1 font-display text-2xl text-white">{money(r.fiveYear)}</p>
          <p className="text-xs text-white/50">with {growthPct}% yearly rises</p>
        </div>
      </div>

      <div className="mt-4 divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.015]">
        {[
          ["This year", money(r.yearly)],
          ["Over 3 years", money(r.threeYear)],
          ["Of which is per-seat tools", money(r.perSeatShare * 12) + " / yr"],
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
          <TrendUp width={18} height={18} className="text-lime" />
          <span className="font-display text-2xl text-lime">{money(r.fiveYear)} over 5 years</span>
        </div>
        <span className="max-w-md text-sm text-white/70">
          Rented, not owned. At the end of it you have paid {money(r.fiveYear)} and own none of
          it. That is fine for the cheap, excellent tools. It is worth questioning for the
          expensive ones that only half fit how you work.
        </span>
      </div>

      <p className="mt-3 text-center text-[0.78rem] text-white/35">
        Not every subscription is worth replacing. Accounting and payments usually are not.
      </p>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href="/tools/saas-vs-custom-calculator" className="btn-primary !rounded-md">
          Should I own this instead?
          <ArrowRight width={18} height={18} />
        </a>
        <a href={site.calendlyUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost !rounded-md">
          Get an honest read
        </a>
      </div>
    </div>
  );
}
