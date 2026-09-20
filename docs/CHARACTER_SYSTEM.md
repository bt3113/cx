# Zero-budget Zat Character System

## Product rule

V1 optimises for a small coherent library, not catalogue size. The canonical object is `CharacterConfig`; neither a screenshot nor a vendor-specific avatar file is the source of truth.

## Runtime architecture

`CharacterConfig` → `CharacterStage` → one of two renderers:

1. **WebGL path:** `character-engine.js` lazy-loads pinned Three.js and assembles the character from modular procedural parts. Material colour overrides, poses, subtle breathing/blinking and editorial lighting are applied at runtime.
2. **Static path:** `CharacterFallback.tsx` renders an SVG from the same configuration when WebGL is unavailable, data-saving is enabled or the device heuristic is very weak.

The 3D renderer is not loaded until a configured character is actually mounted. The Character Creator is a separate route, so its controls and asset discovery never inflate the initial profile payload.

## V1 library

- 4 body presets: Slim, Regular, Athletic, Curvy
- 5 face presets
- 10 skin tones
- 5 eye colours
- 3 eyebrow treatments
- 5 hairstyles
- 6 hair colours
- 3 facial-hair states
- 5 tops
- 3 bottoms
- 3 shoes
- 4 accessory states
- 3 restrained poses

Alex is not a static special case. His default configuration is simply `regular + angular + honey + sidepart + burgundy knit + dark tailored trousers + light sneakers + editorial pose`.

## CharacterStudio concepts adapted

The implementation borrows the *architecture*, not the NFT/wallet product surface:

- modular part manifest
- assembly from compatible part IDs
- colour/material overrides
- screenshot/export path
- animation hooks
- hidden-body strategy (do not generate geometry covered by clothing where practical)
- future GLB/VRM loader seam
- optimisation as an explicit pipeline concern

## GLB / VRM expansion

`character-engine.js` exports `loadLicensedModel(url)`. GLB and VRM are both glTF-family containers, so verified models can be loaded as scenes. V1 does not yet add VRM humanoid retargeting or expression metadata because no external VRM assets ship in the zero-budget library.

When licensed GLB/VRM parts are added later, do not change `CharacterConfig`. Map stable IDs in the manifest to those files. That keeps saved characters portable if the rendering implementation changes.

## Performance budget

- render only the saved character on profile load
- do not preload alternative hair/clothing assets
- cap device pixel ratio in the renderer
- share materials where possible
- keep procedural draw-call count small
- use transparent canvas over the existing Zat world
- use static SVG on data-saver / very weak WebGL devices
- future binary assets should use Meshopt/Draco and KTX2 where the source pipeline supports them
- generate LOD0/LOD1 for imported meshes; mobile should default to LOD1

## Adding a real hairstyle or outfit later

1. Verify the original asset licence and update `docs/ASSET_LICENSES.md`.
2. Process it with `tools/avatar-pipeline/prepare_avatar.py` or the documented Blender steps.
3. Keep the shared skeleton/rest pose and metre scale.
4. Test every supported body preset. If one clips, either fix it or declare the compatible preset list in the manifest; do not ship a visibly broken combination.
5. Add its manifest record. Never hard-code a file URL in a profile.
6. Test desktop, a 390px viewport, WebGL fallback and screenshot capture.
