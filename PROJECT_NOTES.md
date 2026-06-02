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

Recommended folder-based workflow:

1. Put image/video files into theme and series folders under `public/uploads/`
2. Run `npm run sync:works`
3. Review the site locally
4. Commit and push to GitHub

Folder structure:

```text
public/uploads/
  Nature/
    01.jpg
    02.jpg
    seaside-walk/
      03.jpg
      04.jpg
  City/
    01.jpg
    02.jpg
```

Supported theme folders:

```text
Nature
City
Portrait
Travel
Everyday
```

Photos can be placed directly inside a theme folder. In that case, the work
title is the theme name, such as `Nature` or `City`.

When `npm run sync:works` runs, direct photos inside theme folders are renamed
automatically with stable theme numbers:

```text
public/uploads/Nature/IMG_0627.jpg
```

becomes:

```text
public/uploads/Nature/Nature-001.jpg
```

To choose cover images for the main theme cards, put images in:

```text
public/uploads/_covers/
```

Use theme names as filenames:

```text
Nature.jpg
City.jpg
Portrait.jpg
Travel.jpg
Everyday.jpg
```

You can also copy an automatically numbered photo into `_covers/` and keep its
name. Add a number prefix to control homepage order:

```text
public/uploads/_covers/01-Everyday-002.jpg
public/uploads/_covers/02-City-003.jpg
public/uploads/_covers/03-Travel-004.jpg
```

The category name tells the sync script which theme the cover belongs to. The
number prefix controls homepage order.

These cover images appear first in cards and on the homepage. They are not
duplicated inside the normal photo list.

Optional per-folder covers still work too:

```text
public/uploads/Nature/cover.jpg
public/uploads/City/cover.jpg
```

Optional series subfolders also work. For example, `seaside-walk` becomes
`Seaside Walk`.

Color tags can be controlled through folder or file names. For example:

```text
public/uploads/
  Nature/
    seaside-walk-blue-soft/
      01-blue.jpg
      02-soft.jpg
  Travel/
    sunset-road-warm/
      01.jpg
```

Recognized color tags:

```text
green
blue
warm
black and white
night
soft
```

Helpful filename keywords include `sea`, `ocean`, `sky`, `water`, `leaf`,
`grass`, `sunset`, `orange`, `yellow`, `bw`, `mono`, `night`, `dark`, `mist`,
and `haze`.

Optional admin workflow:

1. Update content in `/admin`
2. Export `works.json` from the Admin page
3. Replace `src/data/works.json` with the exported file
4. Commit and push to GitHub

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
