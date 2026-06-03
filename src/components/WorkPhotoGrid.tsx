import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Work, WorkPhoto } from "../types";
import { LivePhoto } from "./LivePhoto";

export interface WorkPhotoItem {
  work: Work;
  photo: WorkPhoto;
}

type Orientation = "portrait" | "landscape";
type ColorGroup = "warm" | "green" | "blue" | "soft" | "night" | "mono";

interface PhotoMeta {
  orientation: Orientation;
  colorGroup: ColorGroup;
  brightness: number;
}

const photoMetaCache = new Map<string, PhotoMeta>();
const colorOrder: ColorGroup[] = ["soft", "warm", "green", "blue", "night", "mono"];

function getColorGroup(r: number, g: number, b: number): ColorGroup {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const brightness = max / 255;
  const saturation = max === 0 ? 0 : (max - min) / max;

  if (saturation < 0.12) {
    return brightness < 0.32 ? "night" : "mono";
  }

  if (brightness < 0.25) {
    return "night";
  }

  if (saturation < 0.22) {
    return "soft";
  }

  if (r >= g && r >= b) {
    return "warm";
  }

  if (g >= r && g >= b) {
    return "green";
  }

  return "blue";
}

function usePhotoMeta(items: WorkPhotoItem[]) {
  const [photoMeta, setPhotoMeta] = useState<Record<string, PhotoMeta>>({});

  useEffect(() => {
    let cancelled = false;

    const uncachedItems = items.filter(({ photo }) => !photoMetaCache.has(photo.src));

    if (uncachedItems.length === 0) {
      setPhotoMeta(
        Object.fromEntries(
          items.map(({ photo }) => [
            photo.src,
            photoMetaCache.get(photo.src) ?? {
              orientation: "portrait",
              colorGroup: "soft",
              brightness: 0.5
            }
          ])
        )
      );
      return;
    }

    Promise.all(
      uncachedItems.map(
        ({ photo }) =>
          new Promise<[string, PhotoMeta]>((resolve) => {
            const image = new Image();
            image.onload = () => {
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");

              if (!context) {
                resolve([
                  photo.src,
                  {
                    orientation:
                      image.naturalWidth > image.naturalHeight ? "landscape" : "portrait",
                    colorGroup: "soft",
                    brightness: 0.5
                  }
                ]);
                return;
              }

              const sampleWidth = 24;
              const sampleHeight = 24;
              canvas.width = sampleWidth;
              canvas.height = sampleHeight;
              context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
              const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);

              let totalR = 0;
              let totalG = 0;
              let totalB = 0;
              let pixels = 0;

              for (let index = 0; index < data.length; index += 4) {
                totalR += data[index];
                totalG += data[index + 1];
                totalB += data[index + 2];
                pixels += 1;
              }

              const averageR = totalR / pixels;
              const averageG = totalG / pixels;
              const averageB = totalB / pixels;
              const brightness = (averageR + averageG + averageB) / (255 * 3);

              resolve([
                photo.src,
                {
                  orientation:
                    image.naturalWidth > image.naturalHeight ? "landscape" : "portrait",
                  colorGroup: getColorGroup(averageR, averageG, averageB),
                  brightness
                }
              ]);
            };
            image.onerror = () =>
              resolve([
                photo.src,
                {
                  orientation: "portrait",
                  colorGroup: "soft",
                  brightness: 0.5
                }
              ]);
            image.src = photo.src;
          })
      )
    ).then((results) => {
      if (cancelled) {
        return;
      }

      for (const [src, meta] of results) {
        photoMetaCache.set(src, meta);
      }

      setPhotoMeta(
        Object.fromEntries(
          items.map(({ photo }) => [
            photo.src,
            photoMetaCache.get(photo.src) ?? {
              orientation: "portrait",
              colorGroup: "soft",
              brightness: 0.5
            }
          ])
        )
      );
    });

    return () => {
      cancelled = true;
    };
  }, [items]);

  return photoMeta;
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

  const photoMeta = usePhotoMeta(items);

  const { portraitItems, landscapeItems } = useMemo(() => {
    const grouped = items.reduce(
      (groups, item) => {
        const orientation = photoMeta[item.photo.src]?.orientation ?? "portrait";
        groups[orientation === "landscape" ? "landscapeItems" : "portraitItems"].push(item);
        return groups;
      },
      { portraitItems: [] as WorkPhotoItem[], landscapeItems: [] as WorkPhotoItem[] }
    );

    const sortByColor = (a: WorkPhotoItem, b: WorkPhotoItem) => {
      const metaA = photoMeta[a.photo.src] ?? {
        orientation: "portrait" as const,
        colorGroup: "soft" as const,
        brightness: 0.5
      };
      const metaB = photoMeta[b.photo.src] ?? {
        orientation: "portrait" as const,
        colorGroup: "soft" as const,
        brightness: 0.5
      };

      const colorDifference =
        colorOrder.indexOf(metaA.colorGroup) - colorOrder.indexOf(metaB.colorGroup);

      if (colorDifference !== 0) {
        return colorDifference;
      }

      const brightnessDifference = metaA.brightness - metaB.brightness;
      if (Math.abs(brightnessDifference) > 0.03) {
        return brightnessDifference;
      }

      if (mixedThemes) {
        return a.photo.src.localeCompare(b.photo.src, "en");
      }

      return a.photo.alt.localeCompare(b.photo.alt, "en");
    };

    grouped.portraitItems.sort(sortByColor);
    grouped.landscapeItems.sort(sortByColor);

    return grouped;
  }, [items, mixedThemes, photoMeta]);

  return (
    <div className="stack-xl">
      <PhotoSection
        items={portraitItems}
        title="Vertical Frames"
        description="Portrait-oriented photographs gathered first for a steadier rhythm."
        variant="portrait"
      />
      <PhotoSection
        items={landscapeItems}
        title="Horizontal Frames"
        description="Landscape-oriented photographs follow as a wider second movement."
        variant="landscape"
      />
    </div>
  );
}
