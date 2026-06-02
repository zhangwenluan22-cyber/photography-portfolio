import { siteConfig } from "../data/siteContent";

export function AboutPage() {
  return (
    <section className="stack-lg">
      <div className="stack-sm">
        <p className="eyebrow">About</p>
        <h1 className="page-title">{siteConfig.aboutTitle}</h1>
      </div>
      <div className="narrow-copy stack-sm">
        {siteConfig.aboutParagraphs.map((paragraph) => (
          <p key={paragraph} className="body-copy">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
