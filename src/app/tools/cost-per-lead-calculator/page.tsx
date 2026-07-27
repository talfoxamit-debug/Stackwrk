import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import LeadValueCalculator from "@/components/LeadValueCalculator";
import { getTool } from "@/lib/tools";

const tool = getTool("cost-per-lead-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/cost-per-lead-calculator" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/cost-per-lead-calculator",
    type: "website",
  },
};

export default function CostPerLeadCalculatorPage() {
  return (
    <ToolLayout tool={tool}>
      <LeadValueCalculator />
    </ToolLayout>
  );
}
