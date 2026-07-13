"use client";

import { useMemo } from "react";
import { TIER_META, type Prospect, type ProspectStage } from "@/lib/prospects";

const todayISO = () => new Date().toISOString().slice(0, 10);
const plusDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

const DIAL_GOAL = 20;

/**
 * The daily driver. Opens to exactly what to do today: follow-ups that are due,
 * then a capped queue of fresh 🟢 CALL-tier leads to dial — each with one-tap
 * actions. Everything writes back through the same `patch` the board uses.
 */
export default function TodayDriver({
  items,
  patch,
  onOpen,
}: {
  items: Prospect[];
  patch: (id: string, d: Partial<Prospect>) => void;
  onOpen: (p: Prospect) => void;
}) {
  const today = todayISO();

  const followUps = useMemo(
    () =>
      items
        .filter((p) => p.nextFollowUp && p.nextFollowUp <= today && p.stage !== "won" && p.stage !== "lost")
        .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)),
    [items, today],
  );

  // Fresh dials: real, local CALL-tier leads not yet contacted.
  const dialQueue = useMemo(
    () => items.filter((p) => p.tier === "call" && p.stage === "new" && !p.lastContacted).slice(0, DIAL_GOAL),
    [items],
  );

  const dialsToday = items.filter((p) => p.lastContacted === today).length;
  const booked = items.filter((p) => p.stage === "call_booked").length;

  const logCall = (p: Prospect) =>
    patch(p.id, {
      lastContacted: today,
      stage: (p.stage === "new" ? "contacted" : p.stage) as ProspectStage,
      nextFollowUp: p.nextFollowUp || plusDays(3),
    });
  const book = (p: Prospect) => patch(p.id, { stage: "call_booked", lastContacted: today });
  const lose = (p: Prospect) => patch(p.id, { stage: "lost", lastContacted: today });
  const snooze = (p: Prospect) => patch(p.id, { nextFollowUp: plusDays(3) });

  const tel = (phone: string) => `tel:${phone.replace(/[^0-9]/g, "")}`;
  const Btn = ({ onClick, children, tone = "ghost" }: { onClick: () => void; children: React.ReactNode; tone?: "ghost" | "lime" | "rose" }) => (
    <button
      onClick={onClick}
      className={`rounded-md px-2.5 py-1.5 text-[0.7rem] font-bold ${
        tone === "lime" ? "border border-lime/40 bg-lime/10 text-lime"
          : tone === "rose" ? "border border-white/10 text-rose-400/80 hover:bg-white/5"
          : "border border-white/12 text-slate-300 hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );

  const Card = ({ p, sub }: { p: Prospect; sub?: string }) => (
    <div className="rounded-xl border border-white/10 bg-[#11161d] p-3">
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => onOpen(p)} className="text-left">
          <span className="text-sm font-semibold text-white hover:text-lime">{p.name}</span>
          <span className="block text-[0.7rem] text-slate-400">{p.city}{sub ? ` · ${sub}` : ""}</span>
        </button>
        {p.tier && <span className={`shrink-0 rounded px-1 text-[0.55rem] font-bold ${TIER_META[p.tier].cls}`}>{TIER_META[p.tier].short}</span>}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {p.phone && <a href={tel(p.phone)} className="rounded-md bg-lime px-2.5 py-1.5 text-[0.7rem] font-bold text-ink">📞 {p.phone}</a>}
        <Btn onClick={() => logCall(p)}>Log call</Btn>
        <Btn onClick={() => book(p)} tone="lime">Booked ✓</Btn>
        <Btn onClick={() => lose(p)} tone="rose">Not interested</Btn>
      </div>
    </div>
  );

  return (
    <div className="mt-5">
      {/* daily progress */}
      <div className="grid grid-cols-3 gap-2 sm:max-w-lg">
        {[
          ["Dials today", `${dialsToday}/${DIAL_GOAL}`, dialsToday >= DIAL_GOAL ? "text-lime" : "text-white"],
          ["Follow-ups due", `${followUps.length}`, followUps.length ? "text-amber-400" : "text-slate-500"],
          ["Calls booked", `${booked}`, "text-lime"],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[0.6rem] uppercase tracking-wide text-slate-500">{l}</p>
            <p className={`text-xl font-extrabold ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Follow-ups */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-amber-400">
            ⏰ Follow-ups due <span className="text-slate-500">({followUps.length})</span>
          </h2>
          {followUps.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-500">Nothing due today. Nice — go make fresh calls. →</p>
          ) : (
            <div className="space-y-2">
              {followUps.map((p) => (
                <div key={p.id} className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => onOpen(p)} className="text-left">
                      <span className="text-sm font-semibold text-white hover:text-lime">{p.name}</span>
                      <span className="block text-[0.7rem] text-slate-400">{p.city} · due {p.nextFollowUp}</span>
                    </button>
                  </div>
                  {p.notes && <p className="mt-1 line-clamp-2 text-[0.7rem] text-slate-500">{p.notes}</p>}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {p.phone && <a href={tel(p.phone)} className="rounded-md bg-lime px-2.5 py-1.5 text-[0.7rem] font-bold text-ink">📞 {p.phone}</a>}
                    <Btn onClick={() => logCall(p)}>Log touch</Btn>
                    <Btn onClick={() => book(p)} tone="lime">Booked ✓</Btn>
                    <Btn onClick={() => snooze(p)}>Snooze +3d</Btn>
                    <Btn onClick={() => lose(p)} tone="rose">Dead</Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fresh dials */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-lime">
            🟢 Today&rsquo;s dials <span className="text-slate-500">(next {dialQueue.length})</span>
          </h2>
          {dialQueue.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-slate-500">
              No fresh CALL-tier leads left. Load the starter list, or switch to the email campaign for the rest.
            </p>
          ) : (
            <div className="space-y-2">
              {dialQueue.map((p) => <Card key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
