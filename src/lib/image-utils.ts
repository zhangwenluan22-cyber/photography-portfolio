import { createId } from "./utils";
import type { WorkPhoto } from "../types";

const baseUrl = import.meta.env.BASE_URL;

export function resolveAssetPath(src = "") {
  if (!src || /^(data:|https?:|blob:)/.test(src) || !src.startsWith("/")) {
    return src;
  }

  const base = baseUrl.replace(/\/$/, "");
  return `${base}${src}`;
}

export function getRouterBasename() {
  const base = baseUrl.replace(/\/$/, "");
  return base || "/";
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load uploaded image"));
    image.src = src;
  });
}

async function compressImage(file: File) {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const ratio = Math.min(1, 2200 / Math.max(image.width, image.height));
  const width = Math.round(image.width * ratio);
  const height = Math.round(image.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.86);
}

export async function filesToWorkPhotos(files: FileList | File[]) {
  const list = Array.from(files);
  const items = await Promise.all(
    list.map(async (file) => {
      const src = await compressImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");

      return {
        id: createId("photo"),
        src,
        alt
      } satisfies WorkPhoto;
    })
  );

  return items;
}

export async function fileToVideoDataUrl(file: File) {
  return readFileAsDataUrl(file);
}
