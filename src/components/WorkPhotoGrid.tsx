import { Link } from "react-router-dom";
import type { Work, WorkPhoto } from "../types";
import { LivePhoto } from "./LivePhoto";

export interface WorkPhotoItem {
  work: Work;
  photo: WorkPhoto;
}

export function WorkPhotoGrid({
  items,
  emptyText = "No photographs found for the current filter."
}: {
  items: WorkPhotoItem[];
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="muted-text">{emptyText}</p>;
  }

  return (
    <div className="work-grid">
      {items.map(({ work, photo }) => (
        <article key={`${work.id}-${photo.id}`} className="work-card">
          <Link to={`/works/${work.slug}`} className="work-card-link">
            <figure className="work-thumb-frame">
              <LivePhoto
                imageSrc={photo.src}
                imageAlt={photo.alt || work.title}
                videoSrc={photo.livePhotoVideo}
                className="work-thumb"
              />
            </figure>
            <div className="work-card-copy">
              <p className="work-category">{work.category}</p>
              <h3>{work.title}</h3>
              <p className="work-subtitle">{photo.alt}</p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
