---
name: react-three-fiber
description: Best practices for React Three Fiber (R3F). Use when creating 3D scenes in React, working with Canvas, useFrame hooks, useThree, Drei helpers, event handling in 3D, and mixing React state with Three.js objects.
---

# React Three Fiber (R3F) Best Practices

React Three Fiber is a React renderer for Three.js. It brings declarative, component-based scene creation to Three.js.

## Core Rules & Patterns

### 1. The Canvas
Always wrap your 3D content inside `<Canvas>` from `@react-three/fiber`.
- The Canvas defines the WebGL renderer.
- It automatically fits its parent container. Make sure the parent has width and height.

### 2. Hooks: `useFrame`
Use `useFrame` to animate objects or run logic on every render frame.
- It MUST be called inside a component that is a child of `<Canvas>`.
- Use the `state` argument to access `clock.elapsedTime` or `camera`.
- `useFrame((state, delta) => {})` - prefer using `delta` for frame-rate independent physics/movement.

### 3. Hooks: `useThree`
Use `useThree` to access the R3F state (camera, scene, gl renderer, viewport dimensions).
- Useful for projecting coordinates or advanced camera manipulations.

### 4. Refs and Mutation
In React, we usually avoid mutating refs. In R3F, **it is the standard way to animate**.
Do NOT use React state (`useState`) to animate properties like position or rotation rapidly, as it triggers full React re-renders which destroys performance.
- Correct: `ref.current.rotation.x += delta` inside `useFrame`.
- Incorrect: `setRotation(r => r + delta)` inside `useFrame`.

### 5. Drei Library (`@react-three/drei`)
Always use Drei helpers when possible instead of building from scratch.
- `Environment` for instant PBR HDRI lighting.
- `OrbitControls` for camera movement.
- `Html` for attaching DOM elements to 3D coordinates (glassmorphism UI overlays).
- `Text` or `Text3D` for text rendering.
- `useGLTF` for loading `.gltf`/`.glb` models.

### 6. Event Handling
R3F meshes have built-in pointer events mimicking the DOM.
- `onClick`, `onPointerOver`, `onPointerOut`.
- Handle hover states locally to change cursor or object color.
