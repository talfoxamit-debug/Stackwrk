"use client";

import { useState } from "react";
import { MATERIALS, NAVY, GREEN } from "@/lib/fence-theme";

const PRIORITIES = [
  { key: "cost", label: "Lowest cost", pick: "chain" },
  { key: "privacy", label: "Privacy", pick: "vinyl" },
  { key: "maint", label: "Zero maintenance", pick: "vinyl" },
  { key: "life", label: "Longest life", pick: "aluminum" },
  { key: "pool", label: "Around a pool", pick: "aluminum" },
] as const;

const ROWS: { label: string; get: (m: (typeof MATERIALS)[number]) => string }[] = [
  { label: "Cost (installed)", get: (m) => m.cost },
  { label: "Maintenance", get: (m) => m.maintenance },
  { label: "Lifespan", get: (m) => m.lifespan },
  { label: "Privacy", get: (m) => m.privacy },
  { label: "Storm rating", get: (m) => m.storm },
  { label: "Best for", get: (m) => m.bestFor },
];

export default function MaterialComparison() {
  const [priority, setPriority] = useState<string>("privacy");
  const winner = PRIORITIES.find((p) => p.key === priority)?.pick;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-500">What matters most?</span>
        {PRIORITIES.map((p) => (
          <button
            key={p.key}
            onClick={() => setPriority(p.key)}
            className="rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
            style={priority === p.key ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36 p-3" />
              {MATERIALS.map((m) => (
                <th key={m.key} className="p-3 text-center align-bottom">
                  <div className="rounded-xl border p-2 transition-colors" style={m.key === winner ? { borderColor: GREEN, background: "#EAF6EF" } : { borderColor: "rgba(0,0,0,0.08)" }}>
                    <span className="block font-extrabold" style={{ color: NAVY }}>{m.name}</span>
                    {m.key === winner && <span className="text-[0.65rem] font-bold uppercase tracking-wide" style={{ color: GREEN }}>Best pick</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-t border-black/[0.06]">
                <td className="p-3 text-xs font-bold uppercase tracking-wide text-slate-500">{r.label}</td>
                {MATERIALS.map((m) => (
                  <td key={m.key} className="p-3 text-center align-top" style={m.key === winner ? { background: "#F3FAF5" } : undefined}>
                    <span className="text-slate-700">{r.get(m)}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
