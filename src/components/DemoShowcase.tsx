"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Check, Sparkles, TrendUp } from "./icons";

/* ---------------------------------------------------------------- Booking */
function BookingDemo() {
  const days = ["Mon 12", "Tue 13", "Wed 14", "Thu 15", "Fri 16", "Sat 17"];
  const slots = ["9:00", "10:30", "12:00", "1:30", "3:00", "4:30"];
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState<number | null>(null);
  const [booked, setBooked] = useState(false);

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lime text-ink">
          <Check width={28} height={28} />
        </span>
        <h4 className="mt-4 font-display text-xl uppercase text-white">You&rsquo;re booked!</h4>
        <p className="mt-2 text-sm text-white/60">
          {days[day]} at {slots[slot ?? 0]} — a confirmation would hit their inbox instantly.
        </p>
        <button onClick={() => { setBooked(false); setSlot(null); }} className="btn-ghost mt-6 !rounded-md !py-2.5 !text-xs">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-7">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Calendar width={18} height={18} className="text-lime" /> Pick a day
      </div>
      <div className="flex flex-wrap gap-2">
        {days.map((d, i) => (
          <button
            key={d}
            onClick={() => setDay(i)}
            className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
              day === i ? "border-lime bg-lime/15 text-lime" : "border-white/12 text-white/70 hover:border-white/30"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mb-3 mt-6 text-sm font-semibold text-white">Available times</div>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((s, i) => (
          <button
            key={s}
            onClick={() => setSlot(i)}
            className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
              slot === i ? "border-lime bg-lime/15 text-lime" : "border-white/12 text-white/70 hover:border-white/30"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        onClick={() => slot !== null && setBooked(true)}
        disabled={slot === null}
        className="btn-primary mt-6 w-full !rounded-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        Confirm booking
        <ArrowRight width={18} height={18} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- Calculator */
const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

function CalculatorDemo() {
  const [visitors, setVisitors] = useState(3000);
  const [value, setValue] = useState(180);
  const current = 1.6;
  const improved = 4.4;
  const currentRev = (visitors * current) / 100 * value;
  const improvedRev = (visitors * improved) / 100 * value;
  const uplift = improvedRev - currentRev;

  return (
    <div className="p-5 sm:p-7">
      <label className="block text-sm font-semibold text-white">
        Monthly visitors: <span className="text-lime">{visitors.toLocaleString()}</span>
        <input
          type="range" min={200} max={20000} step={100} value={visitors}
          onChange={(e) => setVisitors(Number(e.target.value))}
          className="mt-2 w-full accent-lime"
        />
      </label>
      <label className="mt-5 block text-sm font-semibold text-white">
        Average sale value: <span className="text-lime">{money(value)}</span>
        <input
          type="range" min={20} max={2000} step={10} value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="mt-2 w-full accent-lime"
        />
      </label>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-ink-800/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-white/40">Your site now</p>
          <p className="mt-1 font-display text-2xl text-white/70">{money(currentRev)}</p>
          <p className="text-xs text-white/40">/mo · {current}% convert</p>
        </div>
        <div className="rounded-xl border border-lime/30 bg-lime/[0.06] p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-lime">With a Stackwrk site</p>
          <p className="mt-1 font-display text-2xl text-white">{money(improvedRev)}</p>
          <p className="text-xs text-white/50">/mo · {improved}% convert</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-lime/25 bg-lime/[0.04] py-3 text-center">
        <TrendUp width={18} height={18} className="text-lime" />
        <span className="text-sm text-white/80">
          <span className="font-display text-lg text-lime">+{money(uplift)}/mo</span> in recovered revenue
        </span>
      </div>
      <p className="mt-3 text-center text-[0.7rem] text-white/35">
        Illustrative — real lift depends on your traffic &amp; offer.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Chatbot */
type Msg = { from: "bot" | "user"; text: string };
const QA = [
  { q: "What are your hours?", a: "We're open Mon–Sat, 9am–6pm. Want me to book you the next available slot?" },
  { q: "Do you give free quotes?", a: "Yes — free, no-obligation quotes. I can grab your details and have someone reach out within the hour." },
  { q: "Where are you located?", a: "We serve the whole metro area and can come to you. Want directions or a callback?" },
];

function ChatbotDemo() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm your site's AI assistant. Ask me anything — I never sleep." },
  ]);
  const [typing, setTyping] = useState(false);
  const [asked, setAsked] = useState<number[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  function ask(i: number) {
    if (typing || asked.includes(i)) return;
    setAsked((a) => [...a, i]);
    setMessages((m) => [...m, { from: "user", text: QA[i].q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: QA[i].a }]);
    }, 850);
  }

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 300 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <span
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.from === "user" ? "bg-lime text-ink" : "bg-ink-800/80 text-white/85"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <span className="flex gap-1 rounded-2xl bg-ink-800/80 px-4 py-3">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white/50" style={{ animationDelay: `${d * 0.2}s` }} />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.08] pt-4">
        {QA.map((item, i) => (
          <button
            key={i}
            onClick={() => ask(i)}
            disabled={asked.includes(i)}
            className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-lime/50 hover:text-lime disabled:opacity-30"
          >
            {item.q}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ Before/After */
function BeforeAfterDemo() {
  const [pos, setPos] = useState(52);
  return (
    <div className="p-5 sm:p-7">
      <div className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-xl border border-white/12">
        {/* AFTER (modern) — full */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-700 via-ink-600 to-violet-900">
          <div className="grid-backdrop absolute inset-0 opacity-30" />
          <div className="absolute inset-0 flex flex-col items-end justify-center px-6 text-right">
            <span className="text-[0.55rem] uppercase tracking-widest text-lime">Bold Studio</span>
            <span className="mt-1 font-display text-2xl uppercase leading-none text-white sm:text-3xl">Modern.<br />Fast.<br />Converts.</span>
            <span className="mt-3 rounded bg-lime px-3 py-1.5 text-[0.6rem] font-bold uppercase text-ink">Book now →</span>
          </div>
        </div>
        {/* BEFORE (dated) — clipped to pos% */}
        <div className="absolute inset-0 overflow-hidden bg-[#e8e6e0]" style={{ width: `${pos}%` }}>
          <div className="flex h-full flex-col justify-center px-5" style={{ width: "100vw", maxWidth: 520 }}>
            <span className="font-serif text-lg text-[#334]">Welcome to Our Business</span>
            <span className="mt-1 font-serif text-[0.7rem] text-[#667]">Established 2003 · Quality service you can trust.</span>
            <span className="mt-2 font-serif text-[0.65rem] text-[#3355bb] underline">Click here for more info</span>
            <span className="mt-3 h-6 w-24 border border-[#99a] bg-[#dcdad4] text-center text-[0.55rem] leading-6 text-[#556]">Submit</span>
          </div>
        </div>
        {/* Divider */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 -translate-x-1/2 bg-lime" />
          <div className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-lime bg-ink text-center text-xs leading-6 text-lime">↔</div>
        </div>
        {/* Labels */}
        <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-white/80">Before</span>
        <span className="absolute right-3 top-3 rounded bg-lime px-2 py-0.5 text-[0.55rem] font-bold uppercase text-ink">After</span>
      </div>
      <input
        type="range" min={5} max={95} value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Drag to compare before and after"
        className="mt-4 w-full accent-lime"
      />
      <p className="mt-1 text-center text-xs text-white/45">Drag the slider — same business, redesigned to sell.</p>
    </div>
  );
}

/* ------------------------------------------------------------- Showcase */
const TABS = [
  { key: "booking", label: "Booking widget", note: "Let customers book 24/7", render: <BookingDemo /> },
  { key: "calc", label: "Revenue calculator", note: "Show ROI in real numbers", render: <CalculatorDemo /> },
  { key: "chat", label: "AI assistant", note: "Answer & capture leads", render: <ChatbotDemo /> },
  { key: "redesign", label: "Before / After", note: "Modernize a tired site", render: <BeforeAfterDemo /> },
];

export default function DemoShowcase() {
  const [active, setActive] = useState("booking");
  const current = TABS.find((t) => t.key === active) ?? TABS[0];
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              active === t.key
                ? "border-lime bg-lime/15 text-lime"
                : "border-white/12 text-white/60 hover:border-white/30 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-600/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3">
          <Sparkles width={16} height={16} className="text-lime" />
          <span className="text-sm text-white/70">{current.note} — live demo, go ahead and try it</span>
        </div>
        <div key={active} className="animate-fade-up">{current.render}</div>
      </div>
    </div>
  );
}
