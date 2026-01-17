# Blender to Three.js glTF Viewer (TypeScript)

Single-page Three.js viewer that:

- Prompts you to upload a **.glb** (binary glTF) or **.gltf** (JSON glTF)
- Loads it with **GLTFLoader**
- Gives you an interactive camera via **OrbitControls**
- Includes **3 sample .glb files** under `public/models`

## Demo features

- Upload via file picker
- Drag-and-drop a file anywhere on the page
- Click sample buttons (each sets the background color to match the sample)
- Reset view to re-frame the current model

## Getting started

### Prereqs

- Node.js 18+ (recommended)

### Install

```bash
npm install
```

### Run dev server

```bash
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

The build output is in `dist/`.

### Preview the production build

```bash
npm run preview
```

## Sample models

These are already included:

- `public/models/pink_pyramid.glb` (viewer background: purple)
- `public/models/orange_cone.glb` (viewer background: red)
- `public/models/light_green_cube.glb` (viewer background: dark green)

## Notes about `.gltf`

If you upload a **.gltf** (JSON) instead of a **.glb**, make sure any referenced files (like `.bin` buffers and textures) are reachable relative to the `.gltf` file path when served. For quick sharing and portability, **.glb is usually easiest**.

## Optional: regenerate sample `.glb` files

The repo includes a tiny generator script in Python (using `pygltflib`) that writes the sample `.glb` files.

```bash
npm run generate:samples
```

This writes the sample files to `public/models/`.

---

### License

MIT (add/adjust as you prefer).
