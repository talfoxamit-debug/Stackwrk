"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "./icons";

type CheckStatus = "pass" | "warn" | "fail";
type Check = { label: string; status: CheckStatus; detail: string };
type Category = { key: string; label: string; score: number; checks: Check[] };
type Result = {
  ok: true;
  finalUrl: string;
  score: number;
  loadMs: number;
  pageKb: number;
  categories: Category[];
  headline: string;
};

type Phase = "idle" | "loading" | "done" | "error";

function ringColor(score: number) {
  if (score >= 85) return "#CBFF3C";
  if (score >= 65) return "#A8E016";
  if (score >= 40) return "#FBBF24";
  return "#FB5C7D";
}

function StatusDot({ status }: { status: CheckStatus }) {
  const map = {
    pass: { bg: "bg-lime/15 text-lime", char: "✓" },
    warn: { bg: "bg-amber-400/15 text-amber-300", char: "!" },
    fail: { bg: "bg-rose-500/15 text-rose-300", char: "✕" },
  }[status];
  return (
    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${map.bg}`}>
      {map.char}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = ringColor(score);
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl leading-none text-white">{score}</span>
        <span className="text-[0.6rem] uppercase tracking-widest text-white/45">/ 100</span>
      </div>
    </div>
  );
}

export default function AuditTool() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  async function run(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase === "loading" || !url.trim()) return;
    setPhase("loading");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setResult(json);
        setPhase("done");
      } else {
        setError(json.message || "Couldn't audit that site. Try another address.");
        setPhase("error");
      }
    } catch {
      setError("Network error — please try again.");
      setPhase("error");
    }
  }

  const field =
    "w-full rounded-md border border-white/12 bg-ink-800/70 px-4 py-3.5 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20";

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={run} className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center rounded-md border border-white/12 bg-ink-800/70 pl-4 focus-within:border-lime/60 focus-within:ring-2 focus-within:ring-lime/20">
          <span className="select-none text-sm text-white/35">https://</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yoursite.com"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full bg-transparent px-2 py-3.5 text-sm text-white placeholder-white/35 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={phase === "loading"}
          className="btn-primary !rounded-md shrink-0 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {phase === "loading" ? "Scanning…" : "Audit my site"}
          {phase !== "loading" && <ArrowRight width={18} height={18} />}
        </button>
      </form>

      {phase === "error" && (
        <p className="mt-3 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      {phase === "loading" && (
        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-ink-600/50 px-6 py-10 text-white/60">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-lime" />
          Scanning the page, measuring speed, checking mobile, SEO &amp; conversion…
        </div>
      )}

      {phase === "done" && result && (
        <div className="mt-6 animate-fade-up rounded-2xl border border-white/[0.1] bg-ink-600/60 p-6 backdrop-blur-sm sm:p-8">
          {/* Header: score + headline */}
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-7">
            <ScoreRing score={result.score} />
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-violet-400">Your site scored</p>
              <h3 className="mt-1 font-display text-2xl uppercase leading-tight text-white sm:text-3xl">
                {result.headline}
              </h3>
              <p className="mt-2 break-all text-sm text-white/45">
                {result.finalUrl} · {result.loadMs} ms · {result.pageKb} KB
              </p>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {result.categories.map((cat) => (
              <div key={cat.key} className="rounded-xl border border-white/[0.08] bg-ink-800/50 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg uppercase tracking-wide text-white">{cat.label}</span>
                  <span className="font-mono text-sm" style={{ color: ringColor(cat.score) }}>
                    {cat.score}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${cat.score}%`,
                      background: ringColor(cat.score),
                      transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  />
                </div>
                <ul className="mt-4 space-y-2.5">
                  {cat.checks.map((c) => (
                    <li key={c.label} className="flex items-start gap-2.5">
                      <StatusDot status={c.status} />
                      <span className="text-sm">
                        <span className="text-white/85">{c.label}</span>
                        <span className="block text-xs text-white/45">{c.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/[0.08] pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm text-white/70">
              Want me to fix every red flag above and turn this into a site that books customers?
            </p>
            <a href="#about" className="btn-primary !rounded-md shrink-0">
              Get my free audit
              <ArrowRight width={18} height={18} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
