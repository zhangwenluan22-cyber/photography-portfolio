import { journalEntries } from "../data/siteContent";
import { seedWorks } from "../data/seedWorks";
import type { Work, JournalEntry } from "../types";

const WORKS_STORAGE_KEY = "quiet-portfolio-works";
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

export function getStoredWorks(): Work[] {
  return readJSON<Work[]>(WORKS_STORAGE_KEY, seedWorks);
}

export function saveWorks(works: Work[]) {
  window.localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify(works));
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
