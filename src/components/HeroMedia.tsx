"use client";

import Image from "next/image";
import { useState } from "react";
import HeroVisual from "./HeroVisual";
import { hero } from "@/lib/content";

/**
 * Hero mascot. Renders the fox image (hero.image) when set, otherwise falls
 * back to the abstract gradient visual. next/image optimizes the large source
 * PNG down to a small responsive webp for fast mobile load.
 *
 * hero.imageOpaqueBg = the asset has a baked-in dark background, so we blend it
 * with `screen` (dissolves the dark background into the dark hero) plus an
 * elliptical feather mask to hide the image's rectangular edge.
 */
export default function HeroMedia() {
  const src = hero.image;
  const opaqueBg = hero.imageOpaqueBg;
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative z-10 mx-auto aspect-[3/4] w-full max-w-lg">
      {/* Electric glow behind the mascot */}
      <div className="pointer-events-none absolute inset-10 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.4),rgba(46,107,255,0.12)_55%,transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 right-0 h-40 w-[80%] -skew-x-12 bg-[linear-gradient(115deg,transparent,rgba(162,28,224,0.16),rgba(46,107,255,0.4),transparent)] blur-md" />

      {showImage ? (
        <Image
          src={src as string}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 520px"
          onError={() => setFailed(true)}
          style={
            opaqueBg
              ? {
                  maskImage:
                    "radial-gradient(ellipse 92% 94% at 50% 47%, #000 58%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 92% 94% at 50% 47%, #000 58%, transparent 100%)",
                }
              : undefined
          }
          className={`animate-float select-none ${
            opaqueBg
              ? "object-cover object-center mix-blend-screen"
              : "object-contain object-center drop-shadow-[0_0_70px_rgba(162,28,224,0.5)]"
          }`}
        />
      ) : (
        <HeroVisual className="relative h-full w-full drop-shadow-[0_0_60px_rgba(162,28,224,0.35)]" />
      )}
    </div>
  );
}
