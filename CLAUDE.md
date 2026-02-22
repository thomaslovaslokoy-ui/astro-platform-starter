# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

## Project Overview

This is **Astro on Netlify Platform Starter** — a template demonstrating Netlify's core platform primitives integrated with Astro 5. It showcases:

- **Netlify Blobs** — persistent key/value object storage
- **Netlify Image CDN** — automatic image optimization and transformation
- **Netlify Edge Functions** — geolocation-based request routing
- **Cache Tags + On-Demand Revalidation** — fine-grained CDN cache control

Live demo: <https://astro-platform-starter.netlify.app/>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (SSR via Netlify adapter) |
| UI Library | React 19 (islands architecture) |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Hosting | Netlify |
| Storage | Netlify Blobs (`@netlify/blobs`) |
| Functions | Netlify Functions (`@netlify/functions`) |
| Language | TypeScript |
| Font | Inter (variable, via `@fontsource-variable/inter`) |
| Markdown | `marked` + `marked-shiki` (Shiki syntax highlighting) |

---

## Repository Structure

```
astro-platform-starter/
├── netlify/
│   └── edge-functions/
│       └── rewrite.js          # Geo-routing edge function
├── public/                     # Static assets served as-is
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── assets/                 # Processed assets (imported in code)
│   ├── components/             # Reusable Astro components
│   │   ├── Alert.astro
│   │   ├── Diff.astro          # Side-by-side comparison widget
│   │   ├── EdgeFunctionExplainer.astro
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Logo.astro
│   │   └── Markdown.astro      # Renders markdown with syntax highlighting
│   ├── layouts/
│   │   └── Layout.astro        # Root HTML shell (fonts, header, footer)
│   ├── pages/                  # File-based routing (each file = a route)
│   │   ├── api/
│   │   │   ├── blob.ts         # GET /api/blob?key=... — fetch single blob
│   │   │   ├── blobs.ts        # GET/POST /api/blobs — list or create shapes
│   │   │   └── revalidate.ts   # POST /api/revalidate — purge cache tags
│   │   ├── blobs/
│   │   │   ├── _components/    # Private React island components
│   │   │   │   ├── NewShape.tsx
│   │   │   │   ├── ShapeEditor.tsx
│   │   │   │   ├── ShapePreview.tsx
│   │   │   │   └── StoredShapes.tsx
│   │   │   └── index.astro     # /blobs route
│   │   ├── edge/
│   │   │   ├── australia/index.astro
│   │   │   ├── not-australia/index.astro
│   │   │   └── index.astro     # /edge — redirects based on geo
│   │   ├── image-cdn.astro     # /image-cdn demo
│   │   ├── index.astro         # / home page
│   │   └── revalidation.astro  # /revalidation demo
│   ├── styles/
│   │   └── globals.css         # Global Tailwind 4 styles + theme tokens
│   ├── types.ts                # Shared TypeScript types
│   ├── utils.ts                # Shared utilities (blob helpers, cache headers)
│   └── utils/
│       └── highlighter.ts      # Shiki singleton for markdown rendering
├── .prettierrc                 # Prettier formatting config
├── astro.config.mjs            # Astro + Netlify adapter config
├── package.json
├── renovate.json               # Automated dependency updates
└── tsconfig.json
```

### Key Conventions

- **`src/pages/`** — every `.astro` or `.ts` file becomes a route automatically (Astro file-based routing).
- **`src/pages/api/`** — server-side API endpoints; `.ts` files export `GET`, `POST`, etc.
- **`_components/`** directories (prefixed with `_`) are co-located with a page and **not** exposed as routes.
- Reusable components used across multiple pages live in **`src/components/`**.

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:4321
npm run build        # Build production site to ./dist/
npm run preview      # Preview the production build locally
npm run astro        # Run Astro CLI directly (e.g. npm run astro check)
```

**Recommended**: Link to a Netlify project for full local parity with production:

```bash
netlify link
npm run dev          # Uses Netlify CLI dev server with edge functions + blobs
```

Without linking, Netlify Blobs and Edge Functions may not work locally.

---

## Formatting & Code Style

This project uses **Prettier** with no ESLint config file. Adhere to these rules:

- **Single quotes** for strings
- **No trailing commas**
- **Print width**: 160 characters
- **Tab width**: 4 spaces (2 spaces for `.md` and `.yaml` files)
- Format on save is configured in `.vscode/settings.json`

Run Prettier manually:

```bash
npx prettier --write .
```

**TypeScript**: Strict mode is not enabled. The config extends `astro/tsconfigs/base` and sets `jsx: react-jsx` for React components.

---

## Architecture: Astro Islands

This project uses Astro's **islands architecture**. Pages are `.astro` files (zero JS by default). Interactive UI is added via React components with client directives:

```astro
<!-- Hydrate on page load -->
<ShapeEditor client:load />

<!-- Hydrate when visible in viewport -->
<StoredShapes client:visible />
```

React components live alongside their parent page in `_components/` directories or in `src/components/` if shared.

---

## Netlify Platform Features

### Netlify Blobs

Persistent key/value blob storage. The store name is `shapes`.

```typescript
import { getStore } from '@netlify/blobs';

const store = getStore({ name: 'shapes', consistency: 'strong' });
await store.set(key, JSON.stringify(data));
const item = await store.get(key, { type: 'json' });
const { blobs } = await store.list();
```

**API routes** (`src/pages/api/`):
- `GET /api/blobs` — list all stored shapes
- `POST /api/blobs` — save a new shape (body: `BlobProps`)
- `GET /api/blob?key=<key>` — fetch one shape by key

### Netlify Image CDN

Images are served through `/.netlify/images` with query params for on-the-fly transformation:

```
/.netlify/images?url=/images/corgi.jpg&w=800&q=75&fit=cover
```

Astro's `<Image />` component also routes through the CDN automatically.

### Netlify Edge Functions

Located in `netlify/edge-functions/`. The `rewrite.js` function intercepts requests to `/edge` and redirects based on `context.geo.country.code`:

- Australia (`AU`) → `/edge/australia`
- All others → `/edge/not-australia`

### Cache Tags & Revalidation

`src/utils.ts` exports `cacheHeaders(tags)` which returns headers for SSR responses:

```typescript
cacheHeaders(['shapes'])
// → { 'Cache-Control': 'public, max-age=0, must-revalidate',
//     'Netlify-Cache-Tag': 'shapes',
//     'Netlify-CDN-Cache-Control': 'public, s-maxage=31536000' }
```

`POST /api/revalidate` accepts `{ tags: string[] }` and calls the Netlify purge API to invalidate tagged cache entries.

---

## Shared Utilities (`src/utils.ts`)

| Export | Description |
|---|---|
| `randomInt(min, max)` | Random integer in `[min, max)` |
| `uniqueName()` | Generates a unique random name (adjective + color + animal) |
| `generateBlob(params)` | Creates a blob SVG string via the `blobshape` library |
| `cacheHeaders(tags)` | Returns Netlify cache-control headers with cache tags |
| `uploadDisabled` | `true` when `PUBLIC_DISABLE_UPLOADS=true` env var is set |

---

## TypeScript Types (`src/types.ts`)

```typescript
interface BlobParameterProps {
    seed: number;
    size: number;
    edges: number;
    growth: number;
    name: string;
    colors: string[];
}

interface BlobProps {
    svgPath: string;
    parameters: BlobParameterProps;
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `PUBLIC_DISABLE_UPLOADS` | Set to `"true"` to disable blob upload functionality (used in the live demo) |

Netlify environment variables (set in Netlify dashboard or `netlify.toml`) are available at runtime. The Astro config enables `devFeatures.environmentVariables` so they are also accessible during `npm run dev` when linked to a Netlify project.

---

## No Test Suite

This repository has no test framework configured. There are no test files, no `vitest.config.*`, and no test scripts in `package.json`. When adding tests, **Vitest** is the recommended choice for Astro projects.

---

## Dependency Management

Dependencies are kept up to date automatically via **Renovate** (configured in `renovate.json`, extends `netlify-templates/renovate-config`). Do not manually batch-update dependencies unless necessary — let Renovate handle it.

---

## Deployment

The project deploys to Netlify. Pushing to the connected git branch triggers an automatic build (`astro build`) and deployment. The Netlify adapter (`@astrojs/netlify`) handles:

- SSR page rendering via Netlify Functions
- Edge Functions deployment from `netlify/edge-functions/`
- Static asset hosting from `dist/`

To deploy manually:

```bash
npm run build
netlify deploy --prod --dir=dist
```
