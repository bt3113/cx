# Zat

**Everything that makes you, you — in one place.**

A creator-owned personal world: one link holding a person's identity, taste,
tools, work and recommendations, with the context that makes them worth
trusting.

Live: **https://bt3113.github.io/cx/**

## Repository layout

This repository is both the source and the published site, because GitHub
Pages serves from `main` at the repository root.

```
/                 built output — index.html, assets/, media/, fonts/  (served by Pages)
/app              the Vite + React + TypeScript source
/app/reference    the supplied design references, used by the asset pipeline
```

## Running locally

```bash
npm run install:app     # install dependencies
npm run dev             # dev server
npm run build           # type-check, build, and write the site to the repo root
npm run assets          # regenerate imagery from app/reference into app/public/media
```

## Publishing

Branch-based GitHub Pages: committing the built output at the repository root
on `main` publishes it. No GitHub Actions workflow is involved, so this costs
no Actions minutes.

```bash
npm run build && git add -A && git commit -m "Publish" && git push
```
