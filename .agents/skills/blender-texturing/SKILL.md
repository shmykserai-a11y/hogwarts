---
name: blender-texturing
description: Apply materials, HDRI environments, and textures to Blender scenes. Use this skill when the user asks to add materials to objects, light the scene with HDRIs, or apply textures from PolyHaven.
---

# Blender Texturing Skill

This skill focuses on shading, materials, and environment lighting.

## PolyHaven Assets (HDRIs and Textures)
The primary way to texture and light a scene realistically is by fetching assets from PolyHaven.
1. Search for HDRIs or Textures: `mcp_blender_search_polyhaven_assets` (asset_type="hdris" or "textures").
2. Download and import: `mcp_blender_download_polyhaven_asset` specifying the `asset_id` and `asset_type`.
3. Apply Texture: Once a texture is downloaded, use `mcp_blender_set_texture` passing the `object_name` and the downloaded `texture_id`.

## Procedural Node-Based Materials
If PolyHaven assets aren't appropriate, you can write Python code via `mcp_blender_execute_blender_code` to create shader networks.
- *Example (Simple solid color material)*:
```python
import bpy

mat = bpy.data.materials.new(name="GreenLeaves")
mat.use_nodes = True
bsdf = mat.node_tree.nodes.get("Principled BSDF")
bsdf.inputs['Base Color'].default_value = (0.1, 0.8, 0.1, 1)

obj = bpy.data.objects.get("TreeLeaves")
if obj:
    if len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    else:
        obj.data.materials[0] = mat
```
