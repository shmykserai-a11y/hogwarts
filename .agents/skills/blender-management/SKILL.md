---
name: blender-management
description: Manage the Blender scene, get information about objects, check integration statuses (Hunyuan3D, Hyper3D, PolyHaven, Sketchfab), and capture viewport screenshots. Use this skill when the user asks about the current state of the Blender scene or wants to verify the environment.
---

# Blender Management Skill

This skill helps you navigate and manage a Blender scene via the Blender MCP server.

## Checking Scene State
Use `mcp_blender_get_scene_info` to get a list of all objects, materials, and generic scene properties.
Use `mcp_blender_get_object_info` with an `object_name` to get detailed transforms, modifiers, and constraints for a specific object.

## Visualizing the Scene
Use `mcp_blender_get_viewport_screenshot` to capture what the user currently sees. This returns an image you can use to visually confirm operations.

## Checking Integrations
Before using specific generative or asset library tools, check if they are enabled:
- `mcp_blender_get_polyhaven_status`
- `mcp_blender_get_sketchfab_status`
- `mcp_blender_get_hunyuan3d_status`
- `mcp_blender_get_hyper3d_status`

## General Code Execution
If you need to perform scene management tasks like deleting objects, selecting objects, or setting the active camera, use `mcp_blender_execute_blender_code`.
Example Python code to clear all mesh objects:
```python
import bpy
bpy.ops.object.select_all(action='DESELECT')
bpy.ops.object.select_by_type(type='MESH')
bpy.ops.object.delete()
```
