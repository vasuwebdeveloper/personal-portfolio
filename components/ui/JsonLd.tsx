/**
 * Renders one schema.org object as a JSON-LD script tag.
 *
 * Data always comes from the content layer or page constants, never user
 * input. "<" is escaped anyway (the pattern Next.js documents) so a literal
 * "</script>" in any future content value cannot break out of the tag.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
