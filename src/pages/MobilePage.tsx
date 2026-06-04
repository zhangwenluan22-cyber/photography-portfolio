import { Link } from "react-router-dom";
import { siteConfig } from "../data/siteContent";
import { usePortfolio } from "../lib/portfolio-context";

function getSeriesPhotos(
  photos: {
    id: string;
    src: string;
    alt: string;
    orientation?: "portrait" | "landscape";
  }[]
) {
  return photos.filter(
    (photo) => !photo.id.endsWith("-cover") && !photo.src.includes("/_covers/")
  );
}

export function MobilePage() {
  const { works } = usePortfolio();
  const featuredWorks = works
    .filter((item) => item.featured)
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    .slice(0, 3);

  return (
    <main className="mobile-page">
      <header className="mobile-page-header">
        <div>
          <p className="eyebrow">Mobile Edition</p>
          <h1 className="mobile-page-title">{siteConfig.title}</h1>
        </div>
        <Link to="/" className="mobile-page-back">
          Desktop site
        </Link>
      </header>

      <section className="mobile-page-hero">
        <h2 className="mobile-page-headline">{siteConfig.homeHeadline}</h2>
        <p className="mobile-page-copy">{siteConfig.homeIntro}</p>
      </section>

      <section className="mobile-page-section">
        <div className="mobile-page-section-head">
          <div>
            <p className="eyebrow">Featured</p>
            <h2 className="section-title">Start here</h2>
          </div>
          <Link to="/works" className="text-link">
            All works
          </Link>
        </div>

        <div className="mobile-featured-list">
          {featuredWorks.map((work) => (
            <article key={work.id} className="mobile-feature-card">
              <Link to={`/works/${work.slug}`} className="mobile-feature-link">
                <img
                  src={work.photos[0]?.src ?? ""}
                  alt={work.photos[0]?.alt ?? work.title}
                  className="mobile-feature-image"
                />
                <div className="mobile-feature-copy">
                  <p className="work-category">{work.category}</p>
                  <h3>{work.title}</h3>
                  <p className="muted-text">
                    {work.photos.length} photo{work.photos.length === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mobile-page-section">
        <div className="mobile-page-section-head">
          <div>
            <p className="eyebrow">Themes</p>
            <h2 className="section-title">Browse by place</h2>
          </div>
        </div>

        <div className="mobile-theme-list">
          {works.map((work) => (
            <a key={work.id} href={`#${work.slug}`} className="mobile-theme-pill">
              {work.category}
            </a>
          ))}
        </div>
      </section>

      <section className="mobile-page-section mobile-series-list">
        {works.map((work) => {
          const seriesPhotos = getSeriesPhotos(work.photos);
          const leadPhoto = seriesPhotos[0];
          const supportingPhotos = seriesPhotos.slice(1, 4);

          return (
            <article key={work.id} id={work.slug} className="mobile-series-card">
              <div className="mobile-page-section-head">
                <div>
                  <p className="work-category">{work.category}</p>
                  <h2 className="section-title">{work.title}</h2>
                </div>
                <Link to={`/works/${work.slug}`} className="text-link">
                  Open
                </Link>
              </div>

              {work.description ? (
                <p className="mobile-page-copy">{work.description}</p>
              ) : null}

              {leadPhoto ? (
                <div className="mobile-series-showcase">
                  <img
                    src={leadPhoto.src}
                    alt={leadPhoto.alt || work.title}
                    className={`mobile-series-lead-image ${
                      leadPhoto.orientation === "portrait"
                        ? "is-portrait"
                        : "is-landscape"
                    }`}
                  />

                  {supportingPhotos.length ? (
                    <div className="mobile-series-grid">
                      {supportingPhotos.map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.src}
                          alt={photo.alt || work.title}
                          className="mobile-series-image"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <p className="muted-text">
                {seriesPhotos.length} photo{seriesPhotos.length === 1 ? "" : "s"} in
                this series
              </p>
            </article>
          );
        })}
      </section>

      <section className="mobile-page-section">
        <div className="mobile-page-section-head">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="section-title">Stay in touch</h2>
          </div>
        </div>
        <div className="mobile-contact-card">
          <p className="mobile-page-copy">{siteConfig.contactNote}</p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="mobile-contact-link">
            {siteConfig.contactEmail}
          </a>
          <p className="muted-text">{siteConfig.contactInstagram}</p>
        </div>
      </section>
    </main>
  );
}
