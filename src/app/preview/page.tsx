import type { Metadata } from "next";
import FenceHero from "@/components/FenceHero";

export const metadata: Metadata = {
  title: "Preview — fence contractor direction",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <main className="min-h-screen bg-white">
      <FenceHero />
    </main>
  );
}
