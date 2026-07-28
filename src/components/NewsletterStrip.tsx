"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check } from "./icons";
import { track } from "@/lib/track";

/**
 * Newsletter capture strip. Email only, on purpose: every extra field costs
 * signups, and the email is the only thing actually needed to send an issue.
 * Placed at the end of content pages, where someone who just read a guide is
 * most likely to want the next one.
 */
export default function NewsletterStrip({
  heading = "Get the next one before your competitors do",
  sub = "Practical guides on getting more leads, cutting busywork, and owning your software instead of renting it. No fluff, no spam, unsubscribe in one click.",
  source = "newsletter",
}: {
  heading?: string;
  sub?: string;
  source?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErr("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        track("newsletter_signup", { source });
        setStatus("done");
        return;
      }
      setErr(
        res.status === 503
          ? "Signups are not live just yet. Email hello@stackwrk.com and we will add you."
          : json.message || "Something went wrong. Please try again.",
      );
      setStatus("error");
    } catch {
      setErr("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="relative py-14 sm:py-20">
      <div className="container-content">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-800/20 to-[#0b0616] p-8 text-center sm:p-10">
          {status === "done" ? (
            <div className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink">
                <Check width={26} height={26} />
              </span>
              <h3 className="font-display text-2xl uppercase text-white sm:text-3xl">You&rsquo;re in</h3>
              <p className="max-w-md text-sm text-white/60">
                Thanks for subscribing. The next guide lands in your inbox when it publishes.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-display text-2xl uppercase leading-tight text-white sm:text-3xl">
                {heading}
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/60">{sub}</p>

              <form onSubmit={onSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" noValidate>
                {/* Honeypot: hidden from humans, catches bots */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />
                <label className="flex-1">
                  <span className="sr-only">Email address</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@yourbusiness.com"
                    className="w-full rounded-lg border border-white/10 bg-ink-800/70 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-lime/60 focus:ring-2 focus:ring-lime/20"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary !rounded-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "sending" ? "Joining…" : "Subscribe"}
                  {status !== "sending" && <ArrowRight width={18} height={18} />}
                </button>
              </form>

              {status === "error" && (
                <p className="mt-3 text-sm text-fuchsia-300" role="alert">
                  {err}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
