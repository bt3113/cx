# Zat

**Everything that makes you, you — in one place.**

A creator-owned personal world: one link holding a person's identity, taste,
tools, work and recommendations, each with the context that makes it worth
trusting. Identity first, exploration second, trust third, commerce fourth.

**Live: https://bt3113.github.io/cx/**

## Repository layout

This repository is both the source and the published site, because GitHub
Pages serves from `main` at the repository root.

```
/                  built output — served by Pages (index.html, assets/, media/,
                   fonts/, og/, icons/, sitemap.xml, and one folder per route)
/app               Vite + React 19 + TypeScript source
/app/reference     the supplied design references, read by the asset pipeline
/docs/launch       launch copy: positioning, announcement, emails, press
/.env.example      every integration the product is architected for
```

## Running locally

```bash
npm run install:app   # install dependencies
npm run dev           # dev server
npm run build         # type-check, build, then write routes/OG/sitemap to the root
npm run assets        # regenerate imagery from app/reference
npm run qa            # crawl every route, then run the end-to-end journeys
```

## Publishing

Branch-based GitHub Pages: committing the built output at the repository root
on `main` publishes it. **No GitHub Actions workflow is involved**, so this
consumes no Actions minutes.

```bash
npm run build && git add -A && git commit -m "Publish" && git push
```

If the site 404s, Pages is not switched on: repository **Settings → Pages →
Deploy from a branch → `main` → `/ (root)`**.

## What is real and what is not

**Real:** routing and deep links, the content model and trust layer, content
relationships in both directions, saving and collections, 1080 × 1920 Story
generation, Web Share, discovery search, the Studio with draft/published state,
the character builder, per-route HTML with Open Graph and JSON-LD, generated OG
cards, the sitemap, and accessibility.

**Demo-tier, built properly and labelled in the UI:** authentication (an
HMAC-SHA256 session signed in the browser — a static bundle cannot hold a
secret, so it resists tampering, not the device owner), persistence (browser
storage, no database) and analytics history (a deterministic seeded series
merged with your own real interactions in this browser).

**Architected, not faked:** payments, affiliate networks, retailer APIs, social
imports and commerce attribution. Each is named in `.env.example`. No fake
network calls exist anywhere in the codebase.

Creators shown are fictional. Policy pages are drafts pending legal review.
