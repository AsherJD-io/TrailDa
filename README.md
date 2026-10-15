# TrailDa Landing Page

This repository holds the public landing page for TrailDa. The page features
H-Facto, TrailDa's real-time operational monitoring and intelligence capability.

TrailDa is the company and the broader operational-intelligence platform.
H-Facto is the product the public page presents: it follows the operational data
a business already produces, connects the signals, and helps the business
understand what is changing, what deserves attention, and what to do next.

- Production site: https://trailda-dss.vercel.app/
- Book a session: https://calendar.app.google/1SVu6faw9GNBHzxb7

## Tech

A single-page site built with Vite and React. Styling is plain CSS, and the
operational-signal visual is original CSS and SVG animation that respects
`prefers-reduced-motion`.

## Local development

Install dependencies from the committed lockfile, then run the dev server:

```bash
npm ci
npm run dev
```

Lint and produce a production build:

```bash
npm run lint
npm run build
```

The build output is written to `dist/` and is what gets deployed to production.
