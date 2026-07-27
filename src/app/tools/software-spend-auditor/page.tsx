import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import SoftwareSpendAuditor from "@/components/SoftwareSpendAuditor";
import { getTool } from "@/lib/tools";

const tool = getTool("software-spend-auditor")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/software-spend-auditor" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/software-spend-auditor",
    type: "website",
  },
};

export default function SoftwareSpendAuditorPage() {
  return (
    <ToolLayout tool={tool}>
      <SoftwareSpendAuditor />
    </ToolLayout>
  );
}
