# Zat avatar pipeline

This folder is intentionally Blender-first and zero-cost.

## Requirements

- Blender 4.2 LTS or newer
- a source mesh whose commercial-use licence is already recorded in `docs/ASSET_LICENSES.md`

No paid converter, marketplace plugin or avatar SDK is required.

## Standard conversion

```bash
blender --background --python tools/avatar-pipeline/prepare_avatar.py -- \
  --input /absolute/path/source.glb \
  --output /absolute/path/zat-hair-wave-01.glb \
  --asset-id hair-wave-01 \
  --license-id CC0-1.0 \
  --target-height 1.75 \
  --decimate 0.72
```

The script imports GLB/GLTF/FBX/OBJ, normalises world scale, applies transforms, removes objects explicitly prefixed `ZAT_HIDE_`, optionally decimates dense meshes, smooths mesh shading, exports GLB and writes a `.license.json` sidecar.

## Authoring conventions

- metres, Y-up export
- character faces +Z in authoring scene before export
- apply transforms before export
- armature object: `Armature`
- keep names stable; Zat manifests reference IDs, not Blender collection positions
- use one material per garment whenever visually acceptable
- prefer 1K textures for mobile; use 2K only for a hero face/head asset
- do not add a clothing asset that visibly clips any body preset it claims to support
- prefix geometry known to be fully occluded in the final assembly with `ZAT_HIDE_` before batch export

## LOD and compression

The included script performs geometry simplification only. After visual approval, free/open tooling such as glTF-Transform may be added to the pipeline for Meshopt/Draco and KTX2. Do not introduce a hosted paid optimisation API.
