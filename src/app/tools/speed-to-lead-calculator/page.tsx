import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import SpeedToLeadCalculator from "@/components/SpeedToLeadCalculator";
import { getTool } from "@/lib/tools";

const tool = getTool("speed-to-lead-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/speed-to-lead-calculator" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/speed-to-lead-calculator",
    type: "website",
  },
};

export default function SpeedToLeadCalculatorPage() {
  return (
    <ToolLayout tool={tool}>
      <SpeedToLeadCalculator />
    </ToolLayout>
  );
}
