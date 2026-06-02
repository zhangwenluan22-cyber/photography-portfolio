import { Link, useParams } from "react-router-dom";
import { usePortfolio } from "../lib/portfolio-context";
import { formatDisplayDate } from "../lib/utils";
import { LivePhoto } from "../components/LivePhoto";

const cameraLabels: Array<[key: string, string]> = [
  ["camera", "Camera"],
  ["lens", "Lens"],
  ["iso", "ISO"],
  ["shutter", "Shutter"],
  ["aperture", "Aperture"],
  ["focalLength", "Focal Length"]
];

export function WorkDetailPage() {
  const { slug } = useParams();
  const { works } = usePortfolio();
  const work = works.find((item) => item.slug === slug);

  if (!work) {
    return (
      <section className="stack-lg">
        <p className="eyebrow">Work Detail</p>
        <h1 className="page-title">This series could not be found.</h1>
        <Link to="/works" className="text-link">
          Back to works
        </Link>
      </section>
    );
  }

  return (
    <article className="stack-xl">
      <header className="detail-header">
        <p className="eyebrow">{work.category}</p>
        <h1 className="detail-title">{work.title}</h1>
        {work.subtitle ? <p className="detail-subtitle">{work.subtitle}</p> : null}
        <div className="tag-row">
          {work.colorTags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <section className="detail-meta-grid">
        <div className="stack-sm">
          <h2 className="meta-title">Notes</h2>
          <p className="body-copy">{work.description}</p>
        </div>

        <div className="stack-sm">
          {(work.location || work.date) && (
            <div className="meta-list">
              {work.location ? (
                <div className="meta-item">
                  <span>Location</span>
                  <strong>{work.location}</strong>
                </div>
              ) : null}
              {work.date ? (
                <div className="meta-item">
                  <span>Date</span>
                  <strong>{formatDisplayDate(work.date)}</strong>
                </div>
              ) : null}
            </div>
          )}

          {work.cameraSettings &&
          cameraLabels.some(([key]) => {
            return Boolean(work.cameraSettings?.[key as keyof typeof work.cameraSettings]);
          }) ? (
            <div className="meta-list">
              {cameraLabels.map(([key, label]) => {
                const value = work.cameraSettings?.[key as keyof typeof work.cameraSettings];
                if (!value) {
                  return null;
                }

                return (
                  <div className="meta-item" key={key}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="detail-image-stack">
        {work.photos.map((photo) => (
          <figure key={photo.id} className="detail-image-frame">
            <LivePhoto
              imageSrc={photo.src}
              imageAlt={photo.alt}
              videoSrc={photo.livePhotoVideo}
              className="detail-image"
            />
          </figure>
        ))}
      </section>
    </article>
  );
}
