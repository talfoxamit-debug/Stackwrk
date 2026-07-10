/**
 * Server-rendered JSON-LD structured data. Emits a <script type="application/ld+json">
 * so search engines and AI answer engines can parse the page's entities and FAQs.
 * The payload is trusted (built from our own content), so dangerouslySetInnerHTML
 * is safe here.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
