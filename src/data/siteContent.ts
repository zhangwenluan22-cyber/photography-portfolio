import type { JournalEntry } from "../types";

export const siteConfig = {
  title: "ZHANG ARCHIVE",
  homeHeadline: "Quiet photographs for slow attention.",
  homeIntro:
    "A small collection of light, weather, distance, and the ordinary rhythm of looking.",
  welcomeLine: "Welcome to my story",
  adminPassword: "quiet-light-atelier",
  aboutTitle: "About",
  aboutParagraphs: [
    "I photograph landscapes, cities, portraits, and passing details with a preference for stillness over spectacle.",
    "This website is designed like a notebook: spacious, restrained, and open enough for each image to breathe.",
    "Most projects begin with walking, waiting, and noticing how color shifts across the same place at different hours."
  ],
  contactEmail: "hello@example.com",
  contactInstagram: "@quietlight.notes",
  contactNote:
    "For collaboration, print inquiries, portrait sessions, or simply to say hello, you can reach me by email or Instagram."
};

export const journalEntries: JournalEntry[] = [
  {
    id: "journal-1",
    title: "When a place becomes familiar",
    date: "2026-04-12",
    excerpt:
      "Returning to the same street changes what the camera notices first.",
    content: [
      "The first visit is usually about surfaces. Light, shape, color, and movement arrive all at once.",
      "A second or third visit is quieter. I begin to notice pauses between people, repeated gestures, and small alignments that only appear when I stop searching for a perfect frame.",
      "Many of my favorite photographs come from that later stage, when the place no longer needs to impress me."
    ]
  },
  {
    id: "journal-2",
    title: "Photographing without urgency",
    date: "2026-05-03",
    excerpt:
      "Slowness is not the opposite of productivity; sometimes it is the method.",
    content: [
      "I try to leave enough room around the image so it does not feel forced.",
      "That same idea shapes this portfolio: fewer effects, less noise, and more trust in composition, texture, and light.",
      "A photograph can be gentle and still remain precise."
    ]
  }
];
