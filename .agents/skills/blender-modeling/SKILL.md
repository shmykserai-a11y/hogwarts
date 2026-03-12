---
name: blender-modeling
description: Model 3D objects in Blender, either by executing Python code (bpy) for procedural generation, or by generating assets using Hunyuan3D/Hyper3D Rodin, or downloading assets from Sketchfab. Use this skill when the user wants to create, edit, or import 3D models into the scene.
---

# Blender Modeling Skill

This skill provides strategies for creating and modifying 3D geometry in Blender.

## Procedural Modeling (Python logic)
You can use `mcp_blender_execute_blender_code` to shape objects proceduraly using `bpy.ops` or `bmesh`.
- *Example (Creating a basic tree)*:
```python
import bpy

# Create trunk
bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=2, location=(0, 0, 1))
trunk = bpy.context.active_object
trunk.name = "TreeTrunk"

# Create leaves
bpy.ops.mesh.primitive_cone_add(radius1=1.5, depth=3, location=(0, 0, 3.5))
leaves = bpy.context.active_object
leaves.name = "TreeLeaves"
```

## AI Generation (Hunyuan3D & Hyper3D Rodin)
If the user asks for a complex asset that is hard to code procedurally (e.g. "a realistic chair", "a character"), you can generate it.
First, check their status using management tools.
- **Hunyuan3D**: Use `mcp_blender_generate_hunyuan3d_model` (returns a job_id). Then poll with `mcp_blender_poll_hunyuan_job_status`. Once done ("DONE"), use `mcp_blender_import_generated_asset_hunyuan` passing the `zip_file_url` to import it.
- **Hyper3D**: Use `mcp_blender_generate_hyper3d_model_via_text`. Then poll `mcp_blender_poll_rodin_job_status`. Once "Done", use `mcp_blender_import_generated_asset`.

## Asset Libraries (Sketchfab)
Search models: `mcp_blender_search_sketchfab_models`.
Optionally preview: `mcp_blender_get_sketchfab_model_preview`.
Download and import: `mcp_blender_download_sketchfab_model` (requires a `target_size` in meters).
