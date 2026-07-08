import HeroVisual from "./HeroVisual";

export default function HeroMedia() {
  return (
    <div className="relative z-10 mx-auto aspect-[1.12/1] w-full max-w-3xl">
      <div className="pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(162,28,224,0.42),rgba(46,107,255,0.12)_55%,transparent_72%)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-2 right-0 h-48 w-[88%] -skew-x-12 bg-[linear-gradient(115deg,transparent,rgba(162,28,224,0.18),rgba(46,107,255,0.55),rgba(203,255,60,0.35),transparent)] blur-md" />
      <HeroVisual className="relative h-full w-full drop-shadow-[0_0_60px_rgba(162,28,224,0.35)]" />
    </div>
  );
}
