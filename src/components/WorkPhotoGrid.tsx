import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { ColorTag, Work, WorkPhoto } from "../types";
import { LivePhoto } from "./LivePhoto";

export interface WorkPhotoItem {
  work: Work;
  photo: WorkPhoto;
}

type Orientation = "portrait" | "landscape";
type ColorGroup = "soft" | "warm" | "green" | "blue" | "night" | "mono";

const colorOrder: ColorGroup[] = ["soft", "warm", "green", "blue", "night", "mono"];
const landscapePriorityCategories = ["Kamakura", "Jeju"];
const portraitPriorityCategories = ["Everyday", "Travel"];

function getColorGroup(photo: WorkPhoto): ColorGroup {
  const tags = photo.colorTags ?? [];

  if (tags.includes("soft")) {
    return "soft";
  }

  if (tags.includes("warm")) {
    return "warm";
  }

  if (tags.includes("green")) {
    return "green";
  }

  if (tags.includes("blue")) {
    return "blue";
  }

  if (tags.includes("night")) {
    return "night";
  }

  if (tags.includes("black and white")) {
    return "mono";
  }

  return "soft";
}

function getBrightnessWeight(photo: WorkPhoto) {
  const tags = photo.colorTags ?? [];
  let weight = 0;

  if (tags.includes("night")) {
    weight += 3;
  }

  if (tags.includes("black and white")) {
    weight += 2;
  }

  if (tags.includes("soft")) {
    weight -= 1;
  }

  return weight;
}

function PhotoSection({
  items,
  title,
  description,
  variant
}: {
  items: WorkPhotoItem[];
  title: string;
  description: string;
  variant: Orientation;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="stack-md">
      <div className="stack-sm">
        <p className="eyebrow">{title}</p>
        <p className="muted-text">{description}</p>
      </div>

      <div className={`work-grid work-grid-${variant}`}>
        {items.map(({ work, photo }) => (
          <article key={`${work.id}-${photo.id}`} className="work-card">
            <Link to={`/works/${work.slug}#${photo.id}`} className="work-card-link">
              <figure className="work-thumb-frame">
                <LivePhoto
                  imageSrc={photo.src}
                  imageAlt={photo.alt || work.title}
                  videoSrc={photo.livePhotoVideo}
                  className={`work-thumb work-thumb-${variant}`}
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
    </section>
  );
}

export function WorkPhotoGrid({
  items,
  mixedThemes = false,
  emptyText = "No photographs found for the current filter."
}: {
  items: WorkPhotoItem[];
  mixedThemes?: boolean;
  emptyText?: string;
}) {
  if (items.length === 0) {
    return <p className="muted-text">{emptyText}</p>;
  }

  const { portraitItems, landscapeItems } = useMemo(() => {
    const grouped = items.reduce(
      (groups, item) => {
        const orientation = item.photo.orientation ?? "portrait";
        groups[orientation === "landscape" ? "landscapeItems" : "portraitItems"].push(item);
        return groups;
      },
      { portraitItems: [] as WorkPhotoItem[], landscapeItems: [] as WorkPhotoItem[] }
    );

    const sortByStoredMeta = (
      a: WorkPhotoItem,
      b: WorkPhotoItem,
      priorityCategories: string[]
    ) => {
      const priorityA = priorityCategories.indexOf(a.work.category);
      const priorityB = priorityCategories.indexOf(b.work.category);
      const normalizedPriorityA = priorityA === -1 ? 999 : priorityA;
      const normalizedPriorityB = priorityB === -1 ? 999 : priorityB;

      if (normalizedPriorityA !== normalizedPriorityB) {
        return normalizedPriorityA - normalizedPriorityB;
      }

      const colorDifference =
        colorOrder.indexOf(getColorGroup(a.photo)) - colorOrder.indexOf(getColorGroup(b.photo));

      if (colorDifference !== 0) {
        return colorDifference;
      }

      const brightnessDifference = getBrightnessWeight(a.photo) - getBrightnessWeight(b.photo);
      if (brightnessDifference !== 0) {
        return brightnessDifference;
      }

      if (mixedThemes) {
        return a.photo.src.localeCompare(b.photo.src, "en");
      }

      return a.photo.alt.localeCompare(b.photo.alt, "en");
    };

    grouped.portraitItems.sort((a, b) =>
      sortByStoredMeta(a, b, portraitPriorityCategories)
    );
    grouped.landscapeItems.sort((a, b) =>
      sortByStoredMeta(a, b, landscapePriorityCategories)
    );

    return grouped;
  }, [items, mixedThemes]);

  return (
    <div className="stack-xl">
      <PhotoSection
        items={landscapeItems}
        title="Horizontal Frames"
        description="Landscape-oriented photographs lead first, with selected series given the front of the sequence."
        variant="landscape"
      />
      <PhotoSection
        items={portraitItems}
        title="Vertical Frames"
        description="Portrait-oriented photographs follow, with selected series held near the front."
        variant="portrait"
      />
    </div>
  );
}
