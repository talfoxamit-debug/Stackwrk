import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import SaasVsCustomCalculator from "@/components/SaasVsCustomCalculator";
import { getTool } from "@/lib/tools";

const tool = getTool("saas-vs-custom-calculator")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/saas-vs-custom-calculator" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/saas-vs-custom-calculator",
    type: "website",
  },
};

export default function SaasVsCustomCalculatorPage() {
  return (
    <ToolLayout tool={tool}>
      <SaasVsCustomCalculator />
    </ToolLayout>
  );
}
