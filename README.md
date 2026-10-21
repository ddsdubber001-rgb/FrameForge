# FrameForge — Anime & Movie Poster Studio

A mobile-friendly Vite + React + TypeScript poster editor. Upload artwork, fetch available anime or TV metadata, edit poster details, preview the design live, and export a 3840 × 2160 PNG.

## Features

- JPG, PNG and WEBP image upload (25 MB maximum).
- Anime metadata from Jikan / MyAnimeList; TV metadata from TVMaze.
- Editable title, subtitle, description, rating, genre, status, seasons, episodes, language and accent color.
- Full-bleed 16:9 artwork with a dark text fade and cinematic overlay.
- 3840 × 2160 PNG export generated locally in the browser.
- Responsive editor layout for mobile and desktop.

## Metadata limitations

- Anime metadata and ratings depend on Jikan / MyAnimeList availability and rate limits. Jikan provides episode counts, but does not provide a reliable season count for every anime; enter season information manually when needed.
- TV metadata and ratings depend on TVMaze availability.
- Automatic movie search is not configured because a movie provider/API key is not included. The Movie option is manual-only; do not treat it as an automatic search feature.
- Ratings are displayed as a percentage-style value on the artwork by converting 0–10 source ratings to 0–100. The source label is shown next to the rating. This is a display conversion, not a new rating.

## Requirements

- Node.js 22 (Vite 8 requires a supported modern Node version)
- npm

## Run locally

```bash
npm install
npm run typecheck
npm run build
npm run dev

Vite prints the local development URL. To test the production build locally:


npm run preview
