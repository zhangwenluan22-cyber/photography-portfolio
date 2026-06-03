import { readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadsDir = path.join(rootDir, "public", "uploads");
const coversDir = path.join(uploadsDir, "_covers");
const outputFile = path.join(rootDir, "src", "data", "works.json");

const categories = new Set([
  "Nature",
  "City",
  "Seoul",
  "Jeju",
  "Kamakura",
  "Danang",
  "ChiangMai",
  "Tokyo",
  "Hiroshima",
  "Portrait",
  "Travel",
  "Everyday"
]);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const videoExtensions = new Set([".mp4", ".mov", ".webm"]);
const coverBaseNames = new Set(["cover", "featured", "thumbnail", "thumb"]);
const colorTagKeywords = [
  ["green", ["green", "leaf", "leaves", "grass", "tree", "forest"]],
  ["blue", ["blue", "sea", "ocean", "sky", "water"]],
  ["warm", ["warm", "sun", "sunset", "orange", "yellow", "gold"]],
  ["black and white", ["black-and-white", "black_white", "bw", "b-w", "mono"]],
  ["night", ["night", "dark", "evening"]],
  ["soft", ["soft", "mist", "haze", "quiet", "light"]]
];
const fallbackFeaturedCategoryOrder = ["Everyday", "City", "Travel"];

const titleFromFolder = (value) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const inferColorTags = (values) => {
  const text = values.join(" ").toLowerCase();

  const tags = colorTagKeywords
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);

  return [...new Set(tags)];
};

const parseCoverEntry = (entry) => {
  const extension = path.extname(entry.name);
  const baseName = path.basename(entry.name, extension);
  const orderMatch = baseName.match(/^(\d+)[-_ ]+(.+)$/);
  const order = orderMatch ? Number(orderMatch[1]) : undefined;
  const categoryText = (orderMatch ? orderMatch[2] : baseName).toLowerCase();
  const category = [...categories].find((item) => {
    const normalizedCategory = item.toLowerCase();
    return categoryText === normalizedCategory || categoryText.startsWith(`${normalizedCategory}-`);
  });

  return {
    category,
    order
  };
};

const getCoverOrderByCategory = async () => {
  const coverEntries = await listVisibleEntries(coversDir);
  const orderedEntries = coverEntries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({ entry, ...parseCoverEntry(entry) }))
    .filter((item) => item.category && item.order !== undefined)
    .sort((a, b) => a.order - b.order);

  return new Map(orderedEntries.map((item) => [item.category, item.order]));
};

const listVisibleEntries = async (dir) => {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => !entry.name.startsWith("."))
      .sort((a, b) => a.name.localeCompare(b.name, "en"));
  } catch {
    return [];
  }
};

const normalizeCategoryFiles = async (categoryName) => {
  const categoryDir = path.join(uploadsDir, categoryName);
  const entries = await listVisibleEntries(categoryDir);
  const imageEntries = entries.filter((entry) => {
    const extension = path.extname(entry.name).toLowerCase();
    const baseName = path.basename(entry.name, extension).toLowerCase();
    return entry.isFile() && imageExtensions.has(extension) && !coverBaseNames.has(baseName);
  });

  const plannedNames = imageEntries.map((entry, index) => {
    const extension = path.extname(entry.name);
    return {
      from: entry.name,
      to: `${categoryName}-${String(index + 1).padStart(3, "0")}${extension}`
    };
  });

  const needsRename = plannedNames.some(({ from, to }) => from !== to);
  if (!needsRename) {
    return;
  }

  for (const { from } of plannedNames) {
    await rename(path.join(categoryDir, from), path.join(categoryDir, `.__tmp__${from}`));
  }

  for (const { from, to } of plannedNames) {
    await rename(path.join(categoryDir, `.__tmp__${from}`), path.join(categoryDir, to));
  }
};

const getSeriesPhotos = async (categoryName, seriesFolder = "") => {
  const seriesDir = path.join(uploadsDir, categoryName, seriesFolder);
  const entries = await listVisibleEntries(seriesDir);
  const media = entries.filter((entry) => entry.isFile());
  const videosByBaseName = new Map();

  for (const entry of media) {
    const extension = path.extname(entry.name).toLowerCase();
    if (videoExtensions.has(extension)) {
      videosByBaseName.set(path.basename(entry.name, extension), entry.name);
    }
  }

  return media
    .filter((entry) => imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .filter((entry) => !coverBaseNames.has(path.basename(entry.name, path.extname(entry.name)).toLowerCase()))
    .map((entry, index) => {
      const extension = path.extname(entry.name);
      const baseName = path.basename(entry.name, extension);
      const mediaPathParts = ["/uploads", categoryName, seriesFolder, entry.name].filter(Boolean);
      const src = mediaPathParts.join("/");
      const videoName = videosByBaseName.get(baseName);
      const videoPathParts = ["/uploads", categoryName, seriesFolder, videoName].filter(Boolean);

      return {
        id: `${slugify(seriesFolder || categoryName)}-${index + 1}`,
        src,
        alt: titleFromFolder(baseName),
        colorTags: inferColorTags([seriesFolder, entry.name, baseName]),
        ...(videoName
          ? { livePhotoVideo: videoPathParts.join("/") }
          : {})
      };
    });
};

const applyPhotoColorTags = async (works) => {
  const { spawnSync } = await import("node:child_process");
  const python = "/Users/www1/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";
  const imagePaths = works.flatMap((work) =>
    work.photos
      .filter((photo) => !photo.id.endsWith("-cover"))
      .map((photo) => path.join(rootDir, "public", photo.src.replace(/^\/+/, "")))
  );

  if (imagePaths.length === 0) {
    return;
  }

  const script = `
import colorsys, json, sys
from pathlib import Path
from PIL import Image, ImageStat

def tags_for(path):
    image = Image.open(path).convert("RGB")
    small = image.resize((80, 80))
    pixels = list(small.getdata())
    hsv = [colorsys.rgb_to_hsv(r / 255, g / 255, b / 255) for r, g, b in pixels]
    sat = sum(s for _, s, _ in hsv) / len(hsv)
    val = sum(v for _, _, v in hsv) / len(hsv)
    hue_counts = {"green": 0, "blue": 0, "warm": 0}
    for h, s, v in hsv:
        deg = h * 360
        if s < 0.12 or v < 0.12:
            continue
        if 70 <= deg <= 170:
            hue_counts["green"] += 1
        elif 175 <= deg <= 260:
            hue_counts["blue"] += 1
        elif deg <= 65 or deg >= 330:
            hue_counts["warm"] += 1

    result = []
    total = len(hsv)
    for tag in ["green", "blue", "warm"]:
        if hue_counts[tag] / total >= 0.16:
            result.append(tag)

    if sat < 0.13:
        result.append("black and white")
    if val < 0.18:
        result.append("night")
    if sat < 0.28 and val >= 0.28:
        result.append("soft")
    if not result:
        result.append("soft")
    return result

print(json.dumps({path: tags_for(path) for path in sys.argv[1:]}))
`;

  const result = spawnSync(python, ["-", ...imagePaths], {
    input: script,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    console.warn(result.stderr);
    return;
  }

  const tagsByPath = JSON.parse(result.stdout);

  for (const work of works) {
    for (const photo of work.photos) {
      if (photo.id.endsWith("-cover")) {
        continue;
      }

      const photoPath = path.join(rootDir, "public", photo.src.replace(/^\/+/, ""));
      photo.colorTags = [...new Set([...(photo.colorTags || []), ...(tagsByPath[photoPath] || [])])];
    }

    work.colorTags = [
      ...new Set(
        work.photos
          .filter((photo) => !photo.id.endsWith("-cover"))
          .flatMap((photo) => photo.colorTags || [])
      )
    ];
  }
};

const getCoverPhoto = async (categoryName, seriesFolder = "") => {
  if (!seriesFolder) {
    const coverEntries = await listVisibleEntries(coversDir);
    const categoryCover = coverEntries.find((entry) => {
      const extension = path.extname(entry.name);
      const parsedCover = parseCoverEntry(entry);
      return (
        entry.isFile() &&
        imageExtensions.has(extension.toLowerCase()) &&
        parsedCover.category === categoryName
      );
    });

    if (categoryCover) {
      const extension = path.extname(categoryCover.name);
      const baseName = path.basename(categoryCover.name, extension);

      return {
        id: `${slugify(categoryName)}-cover`,
        src: `/uploads/_covers/${categoryCover.name}`,
        alt: titleFromFolder(baseName)
      };
    }
  }

  const seriesDir = path.join(uploadsDir, categoryName, seriesFolder);
  const entries = await listVisibleEntries(seriesDir);
  const coverEntry = entries.find((entry) => {
    const extension = path.extname(entry.name);
    const baseName = path.basename(entry.name, extension).toLowerCase();
    return entry.isFile() && imageExtensions.has(extension.toLowerCase()) && coverBaseNames.has(baseName);
  });

  if (!coverEntry) {
    return null;
  }

  const extension = path.extname(coverEntry.name);
  const baseName = path.basename(coverEntry.name, extension);
  const src = ["/uploads", categoryName, seriesFolder, coverEntry.name].filter(Boolean).join("/");

  return {
    id: `${slugify(seriesFolder || categoryName)}-cover`,
    src,
    alt: titleFromFolder(baseName)
  };
};

const syncWorks = async () => {
  const categoryEntries = await listVisibleEntries(uploadsDir);
  const works = [];

  for (const categoryEntry of categoryEntries) {
    if (!categoryEntry.isDirectory() || !categories.has(categoryEntry.name)) {
      continue;
    }

    await normalizeCategoryFiles(categoryEntry.name);

    const seriesEntries = await listVisibleEntries(path.join(uploadsDir, categoryEntry.name));

    for (const seriesEntry of seriesEntries) {
      if (!seriesEntry.isDirectory()) {
        continue;
      }

      const photos = await getSeriesPhotos(categoryEntry.name, seriesEntry.name);
      if (photos.length === 0) {
        continue;
      }

      const title = titleFromFolder(seriesEntry.name);
      const slug = slugify(`${categoryEntry.name}-${seriesEntry.name}`);
      const coverPhoto = await getCoverPhoto(categoryEntry.name, seriesEntry.name);
      const colorTags = inferColorTags([
        categoryEntry.name,
        seriesEntry.name,
        ...photos.map((photo) => `${photo.src} ${photo.alt}`)
      ]);

      works.push({
        id: slug,
        slug,
        title,
        subtitle: "",
        description: "",
        category: categoryEntry.name,
        colorTags,
        featured: false,
        photos: coverPhoto ? [coverPhoto, ...photos] : photos
      });
    }

    const categoryPhotos = await getSeriesPhotos(categoryEntry.name);
    if (categoryPhotos.length > 0) {
      const title = categoryEntry.name;
      const slug = slugify(categoryEntry.name);
      const coverPhoto = await getCoverPhoto(categoryEntry.name);
      const colorTags = inferColorTags([
        categoryEntry.name,
        ...categoryPhotos.map((photo) => `${photo.src} ${photo.alt}`)
      ]);

      works.push({
        id: slug,
        slug,
        title,
        subtitle: "",
        description: "",
        category: categoryEntry.name,
        colorTags,
        featured: false,
        photos: coverPhoto ? [coverPhoto, ...categoryPhotos] : categoryPhotos
      });
    }
  }

  const featuredWorks = [];
  const addFeaturedWork = (work) => {
    if (featuredWorks.length < 3 && !featuredWorks.some((item) => item.id === work.id)) {
      featuredWorks.push(work);
    }
  };

  const coverOrderByCategory = await getCoverOrderByCategory();
  const configuredFeaturedCategoryOrder =
    coverOrderByCategory.size > 0
      ? [...coverOrderByCategory.entries()]
          .sort(([, orderA], [, orderB]) => orderA - orderB)
          .map(([categoryName]) => categoryName)
      : fallbackFeaturedCategoryOrder;

  configuredFeaturedCategoryOrder
    .map((categoryName) =>
      works.find(
        (work) => work.category === categoryName && work.photos[0]?.src.startsWith("/uploads/_covers/")
      )
    )
    .filter(Boolean)
    .forEach(addFeaturedWork);
  works.filter((work) => work.photos[0]?.src.startsWith("/uploads/_covers/")).forEach(addFeaturedWork);
  works.forEach(addFeaturedWork);

  const featuredIds = new Set(featuredWorks.map((work) => work.id));
  const featuredRanks = new Map(featuredWorks.map((work, index) => [work.id, index + 1]));
  works.forEach((work) => {
    work.featured = featuredIds.has(work.id);
    work.featuredRank = featuredRanks.get(work.id);
  });

  await applyPhotoColorTags(works);

  await writeFile(outputFile, `${JSON.stringify(works, null, 2)}\n`, "utf8");
  console.log(`Synced ${works.length} works to ${path.relative(rootDir, outputFile)}`);
};

syncWorks();
