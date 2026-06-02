import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { siteConfig } from "../data/siteContent";
import { getAdminSession, getJournalEntries, getStoredWorks, saveWorks, setAdminSession } from "./storage";
import { createId, slugify } from "./utils";
import type { AdminWorkFormValues, JournalEntry, Work, WorkPhoto } from "../types";

interface SaveWorkPayload extends AdminWorkFormValues {
  photos: WorkPhoto[];
}

interface PortfolioContextValue {
  works: Work[];
  journalEntries: JournalEntry[];
  isAdminAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  saveWorkItem: (payload: SaveWorkPayload, existingId?: string) => void;
  deleteWorkItem: (id: string) => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function buildWork(payload: SaveWorkPayload, existingId?: string): Work {
  const nextSlug = slugify(payload.title) || createId("work");
  const cameraSettings = {
    camera: payload.camera.trim(),
    lens: payload.lens.trim(),
    iso: payload.iso.trim(),
    shutter: payload.shutter.trim(),
    aperture: payload.aperture.trim(),
    focalLength: payload.focalLength.trim()
  };

  return {
    id: existingId ?? createId("work"),
    slug: nextSlug,
    title: payload.title.trim(),
    subtitle: payload.subtitle.trim() || undefined,
    description: payload.description.trim(),
    category: payload.category,
    colorTags: payload.colorTags,
    location: payload.location.trim() || undefined,
    date: payload.date || undefined,
    cameraSettings: Object.values(cameraSettings).some(Boolean)
      ? cameraSettings
      : undefined,
    photos: payload.photos,
    featured: false
  };
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [works, setWorks] = useState<Work[]>(() => getStoredWorks());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    getAdminSession()
  );

  useEffect(() => {
    saveWorks(works);
  }, [works]);

  const value = useMemo<PortfolioContextValue>(() => {
    return {
      works,
      journalEntries: getJournalEntries(),
      isAdminAuthenticated,
      login: (password: string) => {
        const success = password === siteConfig.adminPassword;
        setIsAdminAuthenticated(success);
        setAdminSession(success);
        return success;
      },
      logout: () => {
        setIsAdminAuthenticated(false);
        setAdminSession(false);
      },
      saveWorkItem: (payload, existingId) => {
        const nextWork = buildWork(payload, existingId);

        setWorks((currentWorks) => {
          if (existingId) {
            return currentWorks.map((item) =>
              item.id === existingId
                ? {
                    ...item,
                    ...nextWork,
                    featured: item.featured
                  }
                : item
            );
          }

          return [nextWork, ...currentWorks];
        });
      },
      deleteWorkItem: (id) => {
        setWorks((currentWorks) => currentWorks.filter((item) => item.id !== id));
      }
    };
  }, [isAdminAuthenticated, works]);

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within PortfolioProvider");
  }

  return context;
}
