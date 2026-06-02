import { journalEntries } from "../data/siteContent";
import repositoryWorks from "../data/works.json";
import type { Work, JournalEntry } from "../types";

const WORKS_DRAFT_KEY = "quiet-portfolio-works-draft";
const ADMIN_SESSION_KEY = "quiet-portfolio-admin-session";

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getRepositoryWorks(): Work[] {
  return repositoryWorks as Work[];
}

export function serializeWorks(works: Work[]) {
  return JSON.stringify(works, null, 2);
}

export function getWorkingWorks(): Work[] {
  return readJSON<Work[]>(WORKS_DRAFT_KEY, getRepositoryWorks());
}

export function saveWorksDraft(works: Work[]) {
  window.localStorage.setItem(WORKS_DRAFT_KEY, JSON.stringify(works));
}

export function clearWorksDraft() {
  window.localStorage.removeItem(WORKS_DRAFT_KEY);
}

export function parseWorksJson(raw: string): Work[] {
  const parsed = JSON.parse(raw) as unknown;
  const works = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null && "works" in parsed
      ? (parsed as { works: Work[] }).works
      : null;

  if (!Array.isArray(works)) {
    throw new Error("JSON must be an array of works.");
  }

  return works as Work[];
}

export function getJournalEntries(): JournalEntry[] {
  return journalEntries;
}

export function getAdminSession() {
  return readJSON<boolean>(ADMIN_SESSION_KEY, false);
}

export function setAdminSession(value: boolean) {
  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(value));
}
