import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import RoiCalculator from "@/components/RoiCalculator";
import { getTool } from "@/lib/tools";

const tool = getTool("roi-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/roi-calculator" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/roi-calculator",
    type: "website",
  },
};

export default function RoiCalculatorPage() {
  return (
    <ToolLayout tool={tool}>
      <RoiCalculator />
    </ToolLayout>
  );
}
