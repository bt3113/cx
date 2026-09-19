# Zat — creator profile + Story sharing MVP

Zat is a mobile-first creator profile for a person's work, taste, tools and recommendations. The public profile uses the dark spatial-grid visual system from the supplied references and includes a creator-side Studio.

## Included routes

- `/` — product/marketing page
- `/alex` — public creator profile
- `/alex/wardrobe`, `/alex/music`, etc. — deep links to individual Spaces
- `/studio` — editable creator profile + Space editor
- `/pricing` — pricing page
- `/health` — server health check when using the included Node server

## One-tap Story system

Every public grid card has its own share action. Zat generates a 1080×1920 PNG in the browser using the actual Space image, title, subtitle, creator, disclosure status and a unique Zat URL.

The full creator profile can also generate a 1080×1920 profile Story featuring the creator plus selected Spaces.

The Story Studio provides:

- live 9:16 preview
- native Web Share API handoff on supported iPhone/Android browsers
- attached PNG file for the system share sheet
- save/download PNG fallback
- copy-link fallback
- unique share URL per Space
- deep-link opening for shared Space URLs
- share event tracking hook

A browser cannot silently publish to a user's Instagram account. On supported mobile browsers, the native share sheet is opened with the generated image so Instagram, Messages, WhatsApp and other installed apps can be selected by the user.

## Run locally

Requires Node 20+.

```bash
npm start
```

Then open:

```text
http://localhost:8080/alex
```

If port 8080 is occupied:

```bash
PORT=8099 npm start
```

## Static hosting

The frontend is also deployable to static hosts. `vercel.json` and `_redirects` are included so SPA/deep-link routes resolve back to `index.html` on common hosts.

## Persistence

The UI works without a backend using browser storage. The included `server.mjs` optionally provides JSON profile persistence and event logging. For production, replace the JSON store with Postgres/D1/Supabase and host creator media in first-party object storage so Story canvas generation remains same-origin and reliable.

## Security / production notes

- Creator writes are protected by `ZAT_ADMIN_TOKEN` when using the included Node server.
- Basic rate limiting and security headers are included.
- Affiliate/sponsored disclosure labels are part of the item data model and are rendered into both the item page and generated Story asset.
- The demo artwork comes from the supplied reference build. Replace it with creator-owned/licensed media before commercial use.
