# Quiet Photography Portfolio

A personal photography portfolio built with React, TypeScript, and Vite. The site includes:

- Fixed left navigation on desktop and a top menu on mobile
- Home, Works, Work Detail, Journal, About, Contact, and Admin pages
- Theme and color-tag filtering for works
- A simple password-protected Admin page
- Multi-image upload with browser-side compression and localStorage persistence
- Optional live-photo style preview using a still image plus a short video clip
- Seed data wired to the sample JPG images in `public/images/samples`

## Run

1. Open a terminal in `/Users/user/Downloads/file/摄影集网站`
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Admin access

- Route: `/admin`
- Default password: `quiet-light-atelier`
- Change the password in `src/data/siteContent.ts` before publishing

## Notes

- Repository content lives in `src/data/works.json`
- Admin edits are kept as a browser draft until you export a new `works.json` and commit it
- For a lighter long-term setup, store media files in `public/uploads` and reference them in JSON with `/uploads/...` paths
- Uploaded images are compressed in the browser before saving to reduce storage usage
- Live-photo clips are optional and are also stored in the browser, so short videos are recommended
- The code is organized so you can later replace `localStorage` with an API, database, or cloud storage service by updating the files in `src/lib`
