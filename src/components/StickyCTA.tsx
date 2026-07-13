"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "./icons";

/**
 * Mobile-only sticky "book audit" bar. Appears once the visitor scrolls past
 * the hero and hides again while the form section (#about) is on screen so it
 * never covers the form. Personalizes its label from a `?for=` / `?industry=`
 * query param (for cold-email campaign links).
 */
export default function StickyCTA() {
  const [scrolled, setScrolled] = useState(false);
  const [atForm, setAtForm] = useState(false);
  const [label, setLabel] = useState("Book a free site audit");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forWho = params.get("for") || params.get("industry");
    if (forWho) {
      const clean = forWho.replace(/[^a-z0-9 &'-]/gi, "").trim().slice(0, 22);
      if (clean) setLabel(`Free ${clean} audit`);
    }

    const onScroll = () => setScrolled(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const about = document.getElementById("about");
    const io = about
      ? new IntersectionObserver(([e]) => setAtForm(e.isIntersecting), { threshold: 0.15 })
      : null;
    if (about && io) io.observe(about);

    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const show = scrolled && !atForm;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <a href="#audit" className="btn-primary flex w-full !rounded-md">
        {label}
        <ArrowRight width={18} height={18} />
      </a>
    </div>
  );
}
