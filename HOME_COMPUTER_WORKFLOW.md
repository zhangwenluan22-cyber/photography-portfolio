# Home Computer Workflow

This file is a simple checklist for continuing this photography portfolio on another computer.

## 1. First-time setup on a new computer

Install these first:

- `git`
- `node`
- `npm`

Then clone the project:

```bash
git clone https://github.com/zhangwenluan22-cyber/photography-portfolio.git
cd photography-portfolio
npm install
```

## 2. Start the local site

```bash
npm run dev
```

Open the local address shown in Terminal.

Usually it is:

```text
http://localhost:5173
```

If that port is busy, Vite will use another one.

## 3. Add or replace photos

Put images into:

```text
public/uploads/
```

Current theme folders include:

```text
Nature
City
Seoul
Jeju
Kamakura
Danang
ChiangMai
Tokyo
Hiroshima
Portrait
Travel
Everyday
```

Examples:

```text
public/uploads/ChiangMai/
public/uploads/Tokyo/
public/uploads/Everyday/
```

You can also use subfolders if needed.

## 4. HEIC support

`HEIC` files are allowed.

This project converts them into web-friendly `jpg` files during sync, so after adding or deleting photos always run:

```bash
npm run sync:works
```

That command:

- renames files into the project format
- updates `src/data/works.json`
- regenerates usable `jpg` files for `HEIC`
- removes broken references after file deletions

## 5. Manually override portrait / landscape grouping

If a photo looks better in the vertical section or horizontal section than the automatic result, edit:

```text
src/data/photoOrientationOverrides.json
```

Example:

```json
{
  "/uploads/City/City-001.JPG": "portrait",
  "/uploads/City/City-004.JPG": "portrait",
  "/uploads/ChiangMai/ChiangMai-002.jpg": "landscape"
}
```

Rules:

- left side = image path
- `"portrait"` = show in the vertical group on `/works`
- `"landscape"` = show in the horizontal group on `/works`

After editing this file, run:

```bash
npm run sync:works
```

## 6. Check the result locally

Run:

```bash
npm run dev
```

Then review:

- Home page
- `/works`
- the clicked photo detail page

## 7. Get the latest changes before editing

If you have edited the project on another computer, pull first:

```bash
git pull --rebase origin main
```

## 8. Publish updates

When everything looks right:

```bash
git add -A
git commit -m "update portfolio"
git push
```

Netlify will deploy automatically after push.

## 9. GitHub push notes

If Git says:

```text
Your branch is ahead of 'origin/main' by 1 commit.
```

The code is already committed. Only push is missing.

If push fails, check GitHub authentication first.

For HTTPS push:

```text
Username: zhangwenluan22-cyber
Password: GitHub Personal Access Token
```

Do not use the normal GitHub login password as the password.

Never share or screenshot the token. If the token leaks, delete it immediately
and create a new one.

## 10. Netlify deployment

Netlify deploys automatically after `main` is pushed to GitHub.

Wait 1-3 minutes after pushing. If the page still looks old, hard refresh the
browser.

## 11. Site links

- GitHub repo: [https://github.com/zhangwenluan22-cyber/photography-portfolio](https://github.com/zhangwenluan22-cyber/photography-portfolio)
- Live site: [https://quiet-photography-portfolio.netlify.app/](https://quiet-photography-portfolio.netlify.app/)

## 12. Good prompt for Codex

```text
Please read PROJECT_NOTES.md and HOME_COMPUTER_WORKFLOW.md first, then inspect the codebase and help me update the photography site. Media lives in public/uploads and I sync content with npm run sync:works.
```
