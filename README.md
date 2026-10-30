# Gadgeon Sports Day 2026

Production website for Gadgeon Sports Day 2026, built with React, TypeScript, Vite, Framer Motion, and Tailwind CSS.

## Local development

```bash
npm install
npm run dev
```

Open the Vite local URL shown in the terminal.

## Production verification

```bash
npm run lint
npm run build
npm run preview
```

The production build is written to `dist/`.

## Deploy to GitHub and Vercel

### GitHub

```bash
git init
git add .
git commit -m "Prepare Gadgeon Sports Day 2026 for production"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

### Vercel dashboard

1. Import the GitHub repository.
2. Framework Preset: **Vite**.
3. Root Directory: repository root.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Install Command: `npm install`.
7. No environment variables are currently required.
8. Deploy the `main` branch.

A `vercel.json` file is included to configure SPA routing and image caching.

## Updating the event

- Event date, location, registration link, and branding: `src/config/event.ts`
- Hero scene images: `src/config/heroScenes.ts`
- Schedule, gaming, athletics, gallery, and demo leaderboard data: `src/data/tournament.ts`
- Keep event and team data clearly marked as placeholders until officially confirmed.

## Assets

Sports images and the Gadgeon icon are served from `public/` and use deployment-safe paths beginning with `/`.
