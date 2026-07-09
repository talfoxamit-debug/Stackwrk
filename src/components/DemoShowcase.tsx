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

const QUICK = [
  "What are your hours?",
  "Do you give free quotes?",
  "How much does a site cost?",
];

/**
 * Tiny on-device "AI" for the demo: keyword-intent matching with a graceful
 * lead-capture fallback. No backend — it shows how a real assistant would
 * answer FAQs and route anything it can't answer into a captured lead.
 */
const INTENTS: { keys: string[]; a: string }[] = [
  { keys: ["hour", "open", "close", "time", "when"], a: "We're open Mon–Sat, 9am–6pm. Want me to book you the next available slot?" },
  { keys: ["quote", "estimate", "free"], a: "Yes — free, no-obligation quotes. Drop your name and I'll have someone reach out within the hour." },
  { keys: ["price", "cost", "how much", "budget", "pricing", "rate"], a: "Most projects start around $2,000 and scale with what you need. Want a tailored quote in 2 minutes?" },
  { keys: ["where", "located", "location", "address", "area"], a: "We serve the whole metro area and work with clients remotely. Want directions or a callback?" },
  { keys: ["book", "appointment", "schedule", "slot", "meeting"], a: "Happy to book you in — I've got openings this week. What day works best for you?" },
  { keys: ["service", "do you", "offer", "build", "make", "website", "app"], a: "We build fast, custom websites and web apps — booking tools, calculators, AI chat and more. What are you looking to build?" },
  { keys: ["contact", "phone", "call", "email", "reach"], a: "Easiest way is right here — share your email and I'll make sure the team follows up today." },
  { keys: ["hello", "hi", "hey", "yo"], a: "Hey! 👋 Ask me anything about hours, pricing, or booking — or tell me what you're building." },
  { keys: ["thank", "thanks", "great", "awesome", "cool"], a: "Anytime! Want me to grab your details so a human can take it from here?" },
];

function respond(text: string): string {
  const t = text.toLowerCase();
  const hit = INTENTS.find((i) => i.keys.some((k) => t.includes(k)));
  if (hit) return hit.a;
  return "Good question — let me get that to the right person. What's the best email to send a full answer to? (This is exactly how the bot captures a lead on your real site.)";
}

function ChatbotDemo() {
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm your site's AI assistant. Ask me anything — I never sleep." },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  function send(text: string) {
    const q = text.trim();
    if (!q || typing) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { from: "bot", text: respond(q) }]);
    }, 750 + Math.min(q.length * 12, 600));
  }

  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 280 }}>
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

      {/* Quick prompts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={typing}
            className="rounded-full border border-white/12 px-3 py-1.5 text-xs text-white/70 transition-colors hover:border-lime/50 hover:text-lime disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Free-text input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="mt-3 flex items-center gap-2 rounded-full border border-white/12 bg-ink-800/60 py-1.5 pl-4 pr-1.5 focus-within:border-lime/50"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your own question…"
          aria-label="Ask the assistant anything"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          aria-label="Send message"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime text-ink transition-opacity disabled:opacity-30"
        >
          <ArrowRight width={16} height={16} />
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------ Before/After */
function BeforeAfterDemo() {
  const [pos, setPos] = useState(52);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  function posFromClientX(clientX: number) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(3, Math.min(97, pct)));
  }

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    posFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging) posFromClientX(e.clientX);
  }
  function endDrag(e: React.PointerEvent) {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }
  // Keyboard support on the handle
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setPos((p) => Math.max(3, p - 4));
    if (e.key === "ArrowRight") setPos((p) => Math.min(97, p + 4));
  }

  return (
    <div className="p-5 sm:p-7">
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        role="slider"
        aria-label="Drag to compare the old site with the redesign"
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className={`relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-xl border border-white/12 ${
          dragging ? "cursor-grabbing" : "cursor-ew-resize"
        }`}
      >
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
        {/* Divider + grabbable handle (whole frame is draggable; handle is the affordance) */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="h-full w-0.5 -translate-x-1/2 bg-lime" />
          <div
            className={`absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-lime bg-ink text-sm text-lime shadow-[0_0_20px_-2px_rgba(203,255,60,0.7)] transition-transform ${
              dragging ? "scale-110" : ""
            }`}
          >
            ↔
          </div>
        </div>
        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[0.55rem] font-bold uppercase text-white/80">Before</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-lime px-2 py-0.5 text-[0.55rem] font-bold uppercase text-ink">After</span>
      </div>
      <p className="mt-3 text-center text-xs text-white/45">
        Drag anywhere on the image — same business, redesigned to sell.
      </p>
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
