/** The hero's signature lime brush-underline accent, reusable on any heading word. */
export default function BrushWord({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`brush-word relative inline-block text-accent-glow ${className}`}>
      {children}
      <svg className="absolute -bottom-4 left-0 w-full sm:-bottom-5" viewBox="0 0 300 20" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <path d="M3 13 C 74 4, 150 4, 297 12" stroke="#CBFF3C" strokeWidth="4" strokeLinecap="round" />
        <path d="M63 17 C 126 10, 208 9, 292 15" stroke="#CBFF3C" strokeWidth="2" strokeLinecap="round" opacity=".75" />
      </svg>
    </span>
  );
}
