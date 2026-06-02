import { siteConfig } from "../data/siteContent";

export function ContactPage() {
  return (
    <section className="stack-lg">
      <div className="stack-sm">
        <p className="eyebrow">Contact</p>
        <h1 className="page-title">Reach out quietly</h1>
        <p className="page-intro narrow-copy">{siteConfig.contactNote}</p>
      </div>

      <div className="contact-list">
        <div className="meta-item">
          <span>Email</span>
          <strong>{siteConfig.contactEmail}</strong>
        </div>
        <div className="meta-item">
          <span>Instagram</span>
          <strong>{siteConfig.contactInstagram}</strong>
        </div>
      </div>
    </section>
  );
}
