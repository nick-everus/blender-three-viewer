import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const outDir = path.resolve('public/models');
fs.mkdirSync(outDir, { recursive: true });

const exporter = new GLTFExporter();

function exportGLB(scene, fileName) {
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const arrayBuffer = result;
        fs.writeFileSync(path.join(outDir, fileName), Buffer.from(arrayBuffer));
        resolve();
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

function makeSceneWith(mesh) {
  const scene = new THREE.Scene();
  scene.add(mesh);
  // Center geometry around origin for nicer framing
  mesh.geometry.computeBoundingBox();
  const box = mesh.geometry.boundingBox;
  const center = new THREE.Vector3();
  box.getCenter(center);
  mesh.position.sub(center);
  return scene;
}

// Pink Pyramid
{
  const geom = new THREE.ConeGeometry(1, 1.6, 4); // 4-sided cone = pyramid
  const mat = new THREE.MeshStandardMaterial({ color: 0xff4fd8, roughness: 0.45, metalness: 0.05 });
  const mesh = new THREE.Mesh(geom, mat);
  const scene = makeSceneWith(mesh);
  await exportGLB(scene, 'pink_pyramid.glb');
}

// Orange Cone
{
  const geom = new THREE.ConeGeometry(1, 1.8, 32);
  const mat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, roughness: 0.5, metalness: 0.03 });
  const mesh = new THREE.Mesh(geom, mat);
  const scene = makeSceneWith(mesh);
  await exportGLB(scene, 'orange_cone.glb');
}

// Light Green Cube
{
  const geom = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const mat = new THREE.MeshStandardMaterial({ color: 0x7cff7a, roughness: 0.55, metalness: 0.02 });
  const mesh = new THREE.Mesh(geom, mat);
  const scene = makeSceneWith(mesh);
  await exportGLB(scene, 'light_green_cube.glb');
}

console.log('Sample .glb files generated in public/models');
