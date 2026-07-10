import type { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import AuditTool from "@/components/AuditTool";
import { getTool } from "@/lib/tools";

const tool = getTool("website-audit")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
  alternates: { canonical: "/tools/website-audit" },
  openGraph: {
    title: tool.metaTitle,
    description: tool.metaDescription,
    url: "/tools/website-audit",
    type: "website",
  },
};

export default function WebsiteAuditPage() {
  return (
    <ToolLayout tool={tool}>
      <AuditTool />
    </ToolLayout>
  );
}
