import './style.css';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SampleMeta = {
  file: string;
  label: string;
  background: string; // CSS hex
};

const SAMPLES: Record<string, SampleMeta> = {
  pyramid: { file: '/models/pink_pyramid.glb', label: 'Pink Pyramid', background: '#5a2d7a' },
  cone: { file: '/models/orange_cone.glb', label: 'Orange Cone', background: '#7a0f19' },
  cube: { file: '/models/light_green_cube.glb', label: 'Light Green Cube', background: '#0b3d1f' }
};

const viewerEl = document.getElementById('viewer') as HTMLDivElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const resetBtn = document.getElementById('resetBtn') as HTMLButtonElement;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
viewerEl.appendChild(renderer.domElement);

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, 1, 0.01, 2000);
camera.position.set(2.2, 1.6, 2.2);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;

// Lights (simple, good default for PBR)
scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 1.0));
const dir = new THREE.DirectionalLight(0xffffff, 1.1);
dir.position.set(3, 5, 2);
scene.add(dir);

// Ground reference grid (toggleable later if you want)
const grid = new THREE.GridHelper(10, 10, 0x4c6a8a, 0x2a3a4c);
grid.material.opacity = 0.35;
(grid.material as THREE.Material).transparent = true;
scene.add(grid);

const loader = new GLTFLoader();

let currentRoot: THREE.Object3D | null = null;
let currentUrl: string | null = null;

function setStatus(msg: string, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

function setBackground(hex: string) {
  renderer.setClearColor(new THREE.Color(hex), 1);
}

function disposeCurrent() {
  if (currentRoot) {
    scene.remove(currentRoot);
    currentRoot.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      }
    });
    currentRoot = null;
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

function frameObject(root: THREE.Object3D) {
  // Compute bounding box
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Move controls target to center
  controls.target.copy(center);

  // Place camera so object fits
  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const dist = maxDim / (2 * Math.tan(fov / 2));
  const safeDist = dist * 1.6;

  // Put camera on a nice diagonal
  const dirVec = new THREE.Vector3(1, 0.85, 1).normalize();
  camera.position.copy(center.clone().add(dirVec.multiplyScalar(safeDist)));

  camera.near = Math.max(0.01, safeDist / 200);
  camera.far = Math.max(2000, safeDist * 10);
  camera.updateProjectionMatrix();
  controls.update();
}

async function loadFromUrl(url: string, label: string) {
  setStatus(`Loading: ${label}`);

  disposeCurrent();

  return new Promise<void>((resolve) => {
    loader.load(
      url,
      (gltf) => {
        currentRoot = gltf.scene || gltf.scenes?.[0];
        if (!currentRoot) {
          setStatus('Loaded file contains no scene.', true);
          resolve();
          return;
        }

        // Ensure something sensible renders
        currentRoot.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = false;
            mesh.receiveShadow = false;
          }
        });

        scene.add(currentRoot);
        frameObject(currentRoot);
        setStatus(`Loaded: ${label}`);
        resolve();
      },
      (evt) => {
        if (evt.total) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setStatus(`Loading: ${label} (${pct}%)`);
        }
      },
      (err) => {
        console.error(err);
        setStatus(
          'Failed to load model. If this is a .gltf, make sure its textures and .bin are accessible at the same relative paths.',
          true
        );
        resolve();
      }
    );
  });
}

async function loadFile(file: File) {
  const name = file.name;
  const lower = name.toLowerCase();

  if (!(lower.endsWith('.glb') || lower.endsWith('.gltf'))) {
    setStatus('Please upload a .glb or .gltf file.', true);
    return;
  }

  // Background stays as-is for user uploads
  currentUrl = URL.createObjectURL(file);
  await loadFromUrl(currentUrl, name);
}

function resize() {
  const w = viewerEl.clientWidth;
  const h = viewerEl.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);

// Drag and drop support
window.addEventListener('dragover', (e) => {
  e.preventDefault();
});
window.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file) loadFile(file);
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) loadFile(file);
});

resetBtn.addEventListener('click', () => {
  if (currentRoot) frameObject(currentRoot);
});

(document.getElementById('samplePyramid') as HTMLButtonElement).addEventListener('click', async () => {
  setBackground(SAMPLES.pyramid.background);
  await loadFromUrl(SAMPLES.pyramid.file, SAMPLES.pyramid.label);
});

(document.getElementById('sampleCone') as HTMLButtonElement).addEventListener('click', async () => {
  setBackground(SAMPLES.cone.background);
  await loadFromUrl(SAMPLES.cone.file, SAMPLES.cone.label);
});

(document.getElementById('sampleCube') as HTMLButtonElement).addEventListener('click', async () => {
  setBackground(SAMPLES.cube.background);
  await loadFromUrl(SAMPLES.cube.file, SAMPLES.cube.label);
});

// Initial sizing + initial background
setBackground('#0b0f16');
resize();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

setStatus('Ready. Upload a .glb or .gltf, or click a sample model.');
