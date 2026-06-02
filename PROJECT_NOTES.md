# Project Notes

This is a personal photography portfolio built with React, TypeScript, and Vite.

## Core structure

- Main app code: `src/`
- Works data: `src/data/works.json`
- Uploaded/static media for long-term use: `public/uploads/`
- Sample seeded images: `public/images/samples/`
- Admin page route: `/admin`

## Admin workflow

- The Admin page can create, edit, and delete works
- Browser uploads are useful for quick draft work
- For long-term cross-computer syncing, prefer path-based media
- Recommended media paths look like:
  - `/uploads/series-name/photo-01.jpg`
  - `/uploads/series-name/photo-01.mp4`

## Cross-computer content workflow

1. Put image/video files into `public/uploads/`
2. Update content in `/admin`
3. Export `works.json` from the Admin page
4. Replace `src/data/works.json` with the exported file
5. Commit and push to GitHub

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Deployment

- GitHub repo is the source of truth
- Netlify is connected to GitHub for automatic deploys
- Pushing to `main` triggers a production deploy

## Good prompt for Codex on a new computer

```text
This is my photography portfolio project. Please read PROJECT_NOTES.md first, then inspect the codebase and help me update the site. Works data is mainly in src/data/works.json and media lives in public/uploads.
```
