"""Repeatable zero-cost Blender preparation for Zat GLB/VRM source assets.

Run from Blender:
  blender --background --python prepare_avatar.py -- --input in.glb --output out.glb ...

This script does not fetch assets. Licence verification happens before ingestion
and is recorded in docs/ASSET_LICENSES.md.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def args() -> argparse.Namespace:
    raw = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--input", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--asset-id", required=True)
    p.add_argument("--license-id", required=True)
    p.add_argument("--source-url", default="")
    p.add_argument("--target-height", type=float, default=1.75)
    p.add_argument("--decimate", type=float, default=1.0)
    return p.parse_args(raw)


def reset() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_asset(path: Path) -> None:
    ext = path.suffix.lower()
    if ext in {".glb", ".gltf", ".vrm"}:
        bpy.ops.import_scene.gltf(filepath=str(path))
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=str(path))
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=str(path))
    else:
        raise SystemExit(f"Unsupported input: {ext}")


def mesh_objects():
    return [o for o in bpy.context.scene.objects if o.type == "MESH"]


def world_bounds(objs):
    corners = []
    for obj in objs:
        corners.extend(obj.matrix_world @ Vector(c) for c in obj.bound_box)
    if not corners:
        raise SystemExit("No mesh objects found")
    lo = Vector((min(v.x for v in corners), min(v.y for v in corners), min(v.z for v in corners)))
    hi = Vector((max(v.x for v in corners), max(v.y for v in corners), max(v.z for v in corners)))
    return lo, hi


def normalize_height(target: float) -> float:
    objs = mesh_objects()
    lo, hi = world_bounds(objs)
    height = hi.z - lo.z
    if height <= 0:
        raise SystemExit("Invalid mesh height")
    scale = target / height
    roots = [o for o in bpy.context.scene.objects if o.parent is None]
    for obj in roots:
        obj.scale *= scale
    bpy.context.view_layer.update()
    lo2, _ = world_bounds(mesh_objects())
    for obj in roots:
        obj.location.z -= lo2.z
    bpy.context.view_layer.update()
    return scale


def clean_and_simplify(ratio: float) -> None:
    for obj in list(bpy.context.scene.objects):
        if obj.name.startswith("ZAT_HIDE_"):
            bpy.data.objects.remove(obj, do_unlink=True)

    for obj in mesh_objects():
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
        for poly in obj.data.polygons:
            poly.use_smooth = True
        if ratio < 0.999 and len(obj.data.polygons) > 4000:
            mod = obj.modifiers.new("Zat_LOD", "DECIMATE")
            mod.ratio = max(0.12, min(1.0, ratio))
            mod.use_collapse_triangulate = True
            bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)


def export_glb(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=str(path),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_skins=True,
        export_morph=True,
        export_animations=True,
    )


def main() -> None:
    a = args()
    source = Path(a.input).resolve()
    output = Path(a.output).resolve()
    reset()
    import_asset(source)
    scale = normalize_height(a.target_height)
    clean_and_simplify(a.decimate)
    export_glb(output)

    sidecar = output.with_suffix(output.suffix + ".license.json")
    sidecar.write_text(
        json.dumps(
            {
                "assetId": a.asset_id,
                "sourceFile": source.name,
                "sourceUrl": a.source_url,
                "license": a.license_id,
                "modifications": [
                    f"normalised height to {a.target_height}m (scale {scale:.6f})",
                    "applied mesh transforms",
                    "removed ZAT_HIDE_ objects",
                    f"decimation ratio {a.decimate}",
                    "smooth shading",
                    "exported as GLB",
                ],
                "attributionRequired": a.license_id not in {"CC0", "CC0-1.0", "CC0-1.0-Universal"},
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Zat asset ready: {output}")
    print(f"Licence sidecar: {sidecar}")


if __name__ == "__main__":
    main()
