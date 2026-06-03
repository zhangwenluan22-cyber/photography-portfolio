export const WORK_CATEGORIES = [
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
] as const;

export const COLOR_TAGS = [
  "green",
  "blue",
  "warm",
  "black and white",
  "night",
  "soft"
] as const;

export type WorkCategory = (typeof WORK_CATEGORIES)[number];
export type ColorTag = (typeof COLOR_TAGS)[number];

export interface CameraSettings {
  camera?: string;
  lens?: string;
  iso?: string;
  shutter?: string;
  aperture?: string;
  focalLength?: string;
}

export interface WorkPhoto {
  id: string;
  src: string;
  alt: string;
  orientation?: "portrait" | "landscape";
  colorTags?: ColorTag[];
  livePhotoVideo?: string;
}

export interface Work {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  category: WorkCategory;
  colorTags: ColorTag[];
  location?: string;
  date?: string;
  cameraSettings?: CameraSettings;
  photos: WorkPhoto[];
  featured?: boolean;
  featuredRank?: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
}

export interface AdminWorkFormValues {
  title: string;
  subtitle: string;
  description: string;
  category: WorkCategory;
  colorTags: ColorTag[];
  location: string;
  date: string;
  camera: string;
  lens: string;
  iso: string;
  shutter: string;
  aperture: string;
  focalLength: string;
}
