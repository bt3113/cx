# Zat character asset licences

This file is the gatekeeper for the Zat character library. An external 3D asset must not be committed or referenced by the production manifest until its exact licence has been checked and recorded here.

## Shipping in V1

### Zat procedural character parts

- **Asset name:** Zat Character V1 procedural body, face, hair, clothing, shoes, accessories and poses
- **Author/source:** Zat project; generated at runtime from original geometry primitives in `app/public/character-engine.js`
- **Source URL:** this repository
- **Exact licence:** project-owned code/geometry; no third-party asset licence dependency
- **Modifications performed:** generated from structured character configuration; material colours and proportions are user-selectable
- **Attribution required:** no external attribution

There are **no third-party human meshes, hairstyles, clothes or marketplace assets bundled in V1**. This is intentional. It prevents the MVP from silently inheriting an incompatible licence from a community asset catalogue.

## Verified free sources — approved for future ingestion, not bundled yet

### MakeHuman bundled/core graphical assets

- **Asset name:** MakeHuman bundled/core graphical assets (base mesh, proxies, targets/modifiers, textures, bundled clothes, poses and expressions)
- **Author/source:** MakeHuman Community
- **Source URL:** https://github.com/makehumancommunity/makehuman
- **Exact licence:** CC0 1.0 Universal for bundled graphical assets. MakeHuman application source code is AGPL; that code is not copied into Zat.
- **Modifications performed:** none in this commit
- **Attribution required:** no for CC0 assets
- **Important scope:** user-contributed/community repository assets are **not assumed to be CC0** and must be checked individually before use.

### MPFB bundled graphical assets

- **Asset name:** MPFB bundled graphical assets (base mesh/proxies, targets/modifiers, textures, bundled clothes, rigs, poses, expressions and mesh JSON data)
- **Author/source:** MakeHuman Community / MPFB
- **Source URL:** https://github.com/makehumancommunity/mpfb2
- **Exact licence:** CC0 1.0 Universal for bundled assets. MPFB source code is GPLv3; that code is not copied into Zat.
- **Modifications performed:** none in this commit
- **Attribution required:** no for CC0 assets

### Blender Human Base Meshes

- **Asset name:** Human Base Meshes v1.4.1
- **Author/source:** Blender Studio and community contributors
- **Source URL:** https://www.blender.org/download/demo-files/
- **Exact licence:** CC0
- **Modifications performed:** none in this commit
- **Attribution required:** no
- **Compatibility note:** Blender lists the bundle as requiring Blender 4.2 LTS or newer.

## Architecture reference — not an imported asset pack

### M3 CharacterStudio

- **Name:** CharacterStudio
- **Author/source:** M3-org and contributors
- **Source URL:** https://github.com/M3-org/CharacterStudio
- **Exact licence:** MIT for the CharacterStudio codebase
- **Use in Zat:** architectural reference only: modular part manifests, character assembly, colour overrides, screenshot/export concepts, animation, optimisation and occlusion concepts
- **Copied assets:** none
- **NFT / wallet / blockchain code:** none
- **Attribution required:** MIT notice is required if substantial code is copied. V1 reimplements the needed architecture rather than copying CharacterStudio source.

## Runtime software, not character assets

### Three.js

- **Source:** https://github.com/mrdoob/three.js
- **Licence:** MIT
- **Use:** browser rendering only, pinned to `0.180.0` in `app/public/character-engine.js`
- **Delivery:** jsDelivr ESM. If Zat later self-hosts the module, preserve the upstream MIT licence notice.

## Licence acceptance checklist for a new asset

Before adding a GLB/VRM to `app/public/character-assets/`:

1. Open the original source page, not a repost or search result.
2. Record the asset name, author, canonical source URL and exact licence here.
3. Confirm commercial use and modification are allowed.
4. Record whether attribution is required and where it must appear.
5. Record every material/mesh modification performed by Zat.
6. Add a matching entry to `app/public/character-assets/manifest.json`.
7. Do not ship an asset whose licence is missing, ambiguous, non-commercial, editorial-only or dependent on a paid subscription.
