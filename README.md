# Blender to Three.js glTF Viewer

<p align="center">
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Blender-F5792A?style=for-the-badge&logo=blender&logoColor=white" alt="Blender" />
</p>

<p align="center">
  <em>A sleek single-page viewer for glTF/GLB 3D models exported from Blender</em>
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📂 **File Upload** | Upload `.glb` or `.gltf` files via file picker |
| 🖱️ **Drag & Drop** | Drop files anywhere on the page |
| 🎨 **Sample Models** | Pre-loaded samples with matching background colors |
| 🔄 **OrbitControls** | Interactive camera rotation, pan, and zoom |
| 🎯 **Reset View** | Re-frame the current model with one click |

---

<img width="1052" height="741" alt="Screenshot 2026-02-01 at 13 20 09" src="https://github.com/user-attachments/assets/3e06216a-ef53-47ca-9984-5a12257c3bbb" />


## 🚀 Getting Started

### Prerequisites

> 📋 **Node.js 18+** recommended

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

🌐 Open the printed local URL (usually `http://localhost:5173`)

### Production Build

```bash
npm run build
```

📦 Output is in `dist/`

### Preview Build

```bash
npm run preview
```

---

## 🎲 Sample Models

Pre-included models to test the viewer:

| Model | File | Background |
|-------|------|------------|
| 🔺 Pink Pyramid | `public/models/pink_pyramid.glb` | ![#800080](https://via.placeholder.com/15/800080/800080?text=+) Purple |
| 🔶 Orange Cone | `public/models/orange_cone.glb` | ![#FF0000](https://via.placeholder.com/15/FF0000/FF0000?text=+) Red |
| 🟩 Green Cube | `public/models/light_green_cube.glb` | ![#006400](https://via.placeholder.com/15/006400/006400?text=+) Dark Green |

---

## 📝 Notes

### About `.gltf` Files

> ⚠️ If uploading a **.gltf** (JSON) instead of **.glb**, ensure any referenced files (`.bin` buffers, textures) are reachable relative to the `.gltf` path when served.
>
> 💡 **Tip:** For quick sharing and portability, **.glb is usually easiest**.

---

## 🔧 Optional: Regenerate Samples

The repo includes a Python generator script (using `pygltflib`) for the sample `.glb` files:

```bash
npm run generate:samples
```

📁 Writes to `public/models/`

---

## 📄 License

<p>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
</p>

---

<p align="center">
  Made with ❤️ using Three.js
</p>
