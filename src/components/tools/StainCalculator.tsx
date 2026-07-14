"use client";

import { useMemo, useState } from "react";
import { NAVY, GREEN } from "@/lib/fence-theme";

const COVERAGE = 175; // sq ft per gallon for fence stain/sealer
const PRICE = 38; // $/gal typical

export default function StainCalculator() {
  const [feet, setFeet] = useState(150);
  const [height, setHeight] = useState(6);
  const [coats, setCoats] = useState(2);
  const [bothSides, setBothSides] = useState(true);

  const { gallons, cost } = useMemo(() => {
    const sides = bothSides ? 2 : 1;
    const area = feet * height * sides * coats;
    const gallons = Math.max(1, Math.ceil(area / COVERAGE));
    return { gallons, cost: gallons * PRICE };
  }, [feet, height, coats, bothSides]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Fence length</label>
          <span className="text-sm font-bold" style={{ color: NAVY }}>{feet} ft</span>
        </div>
        <input type="range" min={20} max={500} step={5} value={feet} onChange={(e) => setFeet(Number(e.target.value))} className="mt-2 w-full accent-emerald-600" />

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Height</label>
            <div className="mt-2 flex gap-2">
              {[4, 6, 8].map((h) => (
                <button key={h} onClick={() => setHeight(h)} className="flex-1 rounded-lg border px-2 py-2 text-sm font-semibold" style={height === h ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{h}′</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Coats</label>
            <div className="mt-2 flex gap-2">
              {[1, 2].map((c) => (
                <button key={c} onClick={() => setCoats(c)} className="flex-1 rounded-lg border px-2 py-2 text-sm font-semibold" style={coats === c ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        <label className="mt-5 block text-xs font-bold uppercase tracking-wide text-slate-500">Coverage</label>
        <button onClick={() => setBothSides((b) => !b)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-semibold" style={bothSides ? { borderColor: GREEN, background: "#EAF6EF", color: NAVY } : { borderColor: "rgba(0,0,0,0.1)", color: "#64748b" }}>{bothSides ? "Both sides" : "One side only"}</button>
      </div>

      <div className="flex flex-col justify-center rounded-2xl border border-black/[0.07] bg-[#FAFAF7] p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">You&rsquo;ll need about</p>
        <p className="mt-1 text-4xl font-extrabold" style={{ color: GREEN }}>{gallons} gal</p>
        <p className="mt-1 text-sm text-slate-500">of stain / sealer</p>
        <p className="mt-3 text-sm font-semibold" style={{ color: NAVY }}>≈ ${cost} in product</p>
        <p className="mt-3 text-[0.75rem] leading-relaxed text-slate-400">Based on ~{COVERAGE} sq ft/gallon. Rough, porous or new wood soaks up more on the first coat.</p>
      </div>
    </div>
  );
}
