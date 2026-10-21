# FrameForge Project Audit Report

Audit date: 2026-10-21

## Scope

Reviewed the supplied ZIP's project tree and all source/configuration files: Vite config, HTML entry point, package scripts/dependencies, TypeScript config, router and route tree, root error/not-found handling, main route UI, metadata API service, canvas rendering/export utility, styles, and both GitHub Actions workflows.

## Findings and changes made

1. **Poster background did not match the supplied reference.** The prior canvas code painted uploaded art only on the right 64% of the canvas. It now uses the uploaded image as a full-bleed 16:9 background, keeps its aspect ratio, and layers a left/bottom dark gradient for readable text.
2. **Overlay hierarchy differed from the reference.** The canvas now draws media-type, status and language pills; a large fitted title; a percentage-style rating with source label; year/seasons/episode facts; genre pills; and a gradient “DOWNLOAD NOW” CTA. Title sizing and genre wrapping are adaptive.
3. **Seasons and episodes were conflated.** They now have separate state and editor fields. Anime season count is not fabricated when the public API does not supply it.
4. **Preview rendering could race.** Each preview is rendered off-screen and copied to the visible canvas only if it is still the current render. Font readiness is awaited before rendering.
5. **Missing React type packages and Vite client declarations.** Added `@types/react`, `@types/react-dom`, and `src/vite-env.d.ts` so the TypeScript type-check workflow has the required declarations.
6. **Tailwind utility color names used by error pages were not mapped.** Added Tailwind v4 theme color aliases for the existing CSS variables.
7. **Root error-page home URL was hard-coded.** It now uses Vite's `BASE_URL`, matching the configured repository deployment path.
8. **Deployment did not run a type check.** The GitHub Pages workflow now runs `npm run typecheck` before building.
9. **README was incomplete.** Replaced it with full setup, deployment, mobile editing and API limitation instructions.
10. **TV summary HTML parsing.** Replaced `innerHTML` assignment with `DOMParser` text extraction.
11. **Small-screen usability.** Added narrow-screen spacing and reduced-motion/touch interaction safeguards; disabled the media selector while a metadata request is in progress.
12. **Movie metadata limitation.** The UI and README now explicitly state that automatic movie lookup is not configured; no API key or movie provider has been invented.

## API behavior and limitations

- Anime search uses Jikan / MyAnimeList and may be affected by public API availability, CORS, or rate limits.
- TV show search uses TVMaze and may be affected by public API availability.
- Ratings are displayed as percentages on the artwork by converting a numeric 0–10 rating to a 0–100 display. The source label is retained; this is only a presentation conversion.
- Jikan does not reliably provide a season count for every anime. When missing, the season field stays blank and can be entered manually.
- Movie automatic metadata search remains unimplemented because the project has no configured movie provider/API key.

## Verification performed

- Confirmed the original ZIP archive could be listed and extracted.
- Checked source structure and reviewed each source/config/workflow file.
- Parsed all TypeScript/TSX source files with the installed TypeScript transpiler; no syntax diagnostics were reported.
- Checked `package.json` as valid JSON and parsed both workflow YAML files.
- Confirmed source file brace/parenthesis counts are balanced for the main edited TSX/CSS files.

## Verification not possible in this environment

- `npm install` timed out while reaching the npm registry; an offline retry failed because required packages were not cached. Therefore `npm run typecheck` and `npm run build` could not be executed here.
- No browser runtime was available, so actual device screenshots, live API calls, GitHub Pages deployment, and real 4K downloads were not end-to-end tested.
- The GitHub Actions workflow and external API availability must still be verified after pushing the updated files to GitHub.

## Suggested post-upload checks

1. Open the repository's **Actions** tab and confirm the deployment's type-check, build and deploy jobs pass.
2. Open the deployed site on mobile and upload a JPG/PNG/WEBP image.
3. Search one known anime and one TV show; verify the linked rating source and metadata.
4. Manually fill seasons if unavailable from the source, then test a long title and several genres.
5. Export the 4K PNG and inspect the downloaded image dimensions (3840 × 2160).
6. Confirm a movie search reports the documented manual-only limitation instead of implying automatic lookup is available.
