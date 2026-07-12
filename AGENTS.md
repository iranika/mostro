# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Mostro is a Japanese manga (4-koma) viewer built with **Astro**, **Vue 3**, **Tailwind CSS v4**, and **DaisyUI v5**. It is a fully static site with no database or external services. All manga assets (~893 images across ~397 episodes) are stored in `src/assets/manga/`.

### Commands

Standard commands are documented in `README.md` and `package.json`:

- **Dev server**: `pnpm dev` — starts at `localhost:4321`
- **Build**: `pnpm build` — outputs to `./dist/`
- **Preview**: `pnpm preview` — preview production build

### Notes

- **No dedicated lint script exists.** The project does not include `@astrojs/check` or `typescript` in `package.json`, so `pnpm astro check` will prompt to install them interactively. Avoid running it in non-interactive environments unless those deps are added first.
- **pnpm build scripts warning**: After `pnpm install`, pnpm warns about ignored build scripts for `esbuild`, `sharp`, and `workerd`. The dev server and build still work correctly without approving them, since esbuild ships prebuilt binaries and sharp/workerd are only needed for image optimization and Cloudflare Workers deployment respectively.
- **Cloudflare adapter is commented out** in `astro.config.mjs`. The project builds as a static site by default.
- **Build output**: `pnpm build` generates a small number of static pages (the homepage `/` plus a single `/viewer` page that reads the episode via a `?page=` query param, and the `/manga.json` endpoint). The episode data comes from `src/pages/manga.json.ts`, and manga assets live in `src/assets/manga/`.
