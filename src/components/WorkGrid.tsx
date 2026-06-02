import { Link } from "react-router-dom";
import type { Work } from "../types";
import { LivePhoto } from "./LivePhoto";

export function WorkGrid({
  works,
  emptyText = "No work found for the current filter."
}: {
  works: Work[];
  emptyText?: string;
}) {
  if (works.length === 0) {
    return <p className="muted-text">{emptyText}</p>;
  }

  return (
    <div className="work-grid">
      {works.map((work) => (
        <article key={work.id} className="work-card">
          <Link to={`/works/${work.slug}`} className="work-card-link">
            <figure className="work-thumb-frame">
              <LivePhoto
                imageSrc={work.photos[0]?.src ?? ""}
                imageAlt={work.photos[0]?.alt ?? work.title}
                videoSrc={work.photos[0]?.livePhotoVideo}
                className="work-thumb"
              />
            </figure>
            <div className="work-card-copy">
              <p className="work-category">{work.category}</p>
              <h3>{work.title}</h3>
              {work.subtitle ? <p className="work-subtitle">{work.subtitle}</p> : null}
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
