import { getTranslations } from "next-intl/server";

type Namespace = "about" | "privacy" | "terms";

type Props = {
  namespace: Namespace;
};

export default async function LegalArticle({ namespace }: Props) {
  const t = await getTranslations(namespace);
  const body = t("body") as string;
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p.trim()}
          </p>
        ))}
      </div>
    </article>
  );
}
