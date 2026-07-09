"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches a pointermove listener to its PARENT element and exposes the cursor
 * position as CSS vars --mx / --my in the range [-1, 1] (0 at center). Sibling
 * layers translate by `calc(var(--mx) * Npx)` at different rates for a subtle
 * depth parallax. Same parent-attach pattern as CardSpotlight.
 *
 * Skips entirely for touch devices and reduced-motion users; values ease back
 * to 0 when the pointer leaves.
 */
export default function PointerVars() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    let raf = 0;
    let tx = 0, ty = 0; // targets
    let cx = 0, cy = 0; // current (lerped)

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      parent.style.setProperty("--mx", cx.toFixed(4));
      parent.style.setProperty("--my", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <span ref={ref} aria-hidden="true" className="hidden" />;
}
