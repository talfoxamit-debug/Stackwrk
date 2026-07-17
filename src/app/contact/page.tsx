import type { Metadata } from "next";
import AuditForm from "@/components/AuditForm";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import BrushWord from "@/components/BrushWord";
import CardSpotlight from "@/components/CardSpotlight";
import { Mail, Phone, Calendar, ArrowRight } from "@/components/icons";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact | Stackwrk",
  description:
    "Get a free website mockup or book a call with Stackwrk. We build conversion-first websites for fence & exterior contractors in South Florida.",
  alternates: { canonical: "https://stackwrk.com/contact" },
};

const PHONE = "(754) 551-2828";

const methods = [
  { Icon: Mail, label: "Email", value: "hello@stackwrk.com", href: "mailto:hello@stackwrk.com" },
  { Icon: Phone, label: "Call or text", value: PHONE, href: `tel:${PHONE.replace(/[^0-9]/g, "")}` },
  { Icon: Calendar, label: "Book a call", value: "Pick a time that works", href: site.calendlyUrl },
];

export default function ContactPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden pb-4 pt-28 sm:pt-32">
        <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.14]" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(203,255,60,0.1),transparent_70%)] blur-2xl" />
        <div className="container-content relative z-10 text-center">
          <Reveal className="mx-auto max-w-2xl">
            <p className="eyebrow">Contact</p>
            <h1 className="mt-3 font-display text-5xl uppercase leading-[0.92] text-white sm:text-6xl">
              Let&rsquo;s get you<br /><BrushWord>booked solid.</BrushWord>
            </h1>
            <p className="mt-8 text-lg leading-relaxed text-white/60">
              Send us your current site (or just your Facebook page) and we&rsquo;ll rebuild your
              homepage from your own photos, free and with no obligation. Or reach us directly below.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-6 pt-8 sm:pt-10">
        <div className="container-content grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* contact methods */}
          <Reveal className="space-y-3">
            {methods.map(({ Icon, label, value, href }) => (
              <a
                key={label}
                href={href}
                {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-lime/30 hover:bg-white/[0.04]"
              >
                <CardSpotlight />
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime/40 bg-lime/[0.06] text-lime shadow-glow-lime transition-transform duration-300 group-hover:scale-110">
                  <Icon width={20} height={20} />
                </span>
                <span className="relative z-10 min-w-0">
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-wide text-white/55">{label}</span>
                  <span className="block truncate font-semibold text-white">{value}</span>
                </span>
                <ArrowRight width={16} height={16} className="relative z-10 ml-auto shrink-0 text-white/30 transition-colors group-hover:text-lime" />
              </a>
            ))}
            <p className="px-1 pt-2 text-sm leading-relaxed text-white/55">
              We reply within one business day. Prefer to talk it through? Book a call and we&rsquo;ll
              review your site and goals together, no pressure.
            </p>
          </Reveal>

          {/* mockup form */}
          <Reveal delay={90} className="card relative overflow-hidden p-6 sm:p-8">
            <CardSpotlight />
            <div className="relative z-10">
              <h2 className="font-display text-2xl uppercase text-white">Get a free site mockup</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                Tell us about your business and we&rsquo;ll send a free homepage concept built from your own photos.
              </p>
              <div className="mt-5">
                <AuditForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
