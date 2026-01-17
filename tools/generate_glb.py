import os
import math
import numpy as np
from pygltflib import (
    GLTF2, Scene, Node, Mesh, Primitive, Buffer, BufferView, Accessor,
    Asset, Material, PbrMetallicRoughness
)

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'models')
os.makedirs(OUT_DIR, exist_ok=True)

# --- helpers ---

def compute_normals(positions: np.ndarray, indices: np.ndarray) -> np.ndarray:
    """Compute per-vertex normals from positions (N,3) and triangle indices (M,3)."""
    normals = np.zeros_like(positions, dtype=np.float32)
    for tri in indices:
        i0, i1, i2 = tri
        v0, v1, v2 = positions[i0], positions[i1], positions[i2]
        n = np.cross(v1 - v0, v2 - v0)
        ln = np.linalg.norm(n)
        if ln > 0:
            n = n / ln
        normals[i0] += n
        normals[i1] += n
        normals[i2] += n
    # normalize
    lens = np.linalg.norm(normals, axis=1)
    lens[lens == 0] = 1
    normals = (normals.T / lens).T
    return normals.astype(np.float32)


def make_gltf_mesh(name: str, positions: np.ndarray, indices: np.ndarray, base_color_rgba) -> GLTF2:
    positions = positions.astype(np.float32)
    indices = indices.astype(np.uint32)
    normals = compute_normals(positions, indices)

    # Flatten data
    pos_bytes = positions.tobytes()
    nor_bytes = normals.tobytes()
    idx_bytes = indices.reshape(-1).tobytes()

    # Concatenate into one binary blob
    blob = pos_bytes + nor_bytes + idx_bytes

    gltf = GLTF2(asset=Asset(version="2.0"))

    # Buffer
    gltf.buffers.append(Buffer(byteLength=len(blob)))

    # BufferViews
    bv_pos = BufferView(buffer=0, byteOffset=0, byteLength=len(pos_bytes), target=34962)  # ARRAY_BUFFER
    bv_nor = BufferView(buffer=0, byteOffset=len(pos_bytes), byteLength=len(nor_bytes), target=34962)
    bv_idx = BufferView(buffer=0, byteOffset=len(pos_bytes) + len(nor_bytes), byteLength=len(idx_bytes), target=34963)  # ELEMENT_ARRAY_BUFFER
    gltf.bufferViews.extend([bv_pos, bv_nor, bv_idx])

    # Accessors
    acc_pos = Accessor(
        bufferView=0,
        byteOffset=0,
        componentType=5126,  # FLOAT
        count=positions.shape[0],
        type="VEC3",
        max=positions.max(axis=0).tolist(),
        min=positions.min(axis=0).tolist(),
    )
    acc_nor = Accessor(
        bufferView=1,
        byteOffset=0,
        componentType=5126,
        count=normals.shape[0],
        type="VEC3",
    )
    acc_idx = Accessor(
        bufferView=2,
        byteOffset=0,
        componentType=5125,  # UNSIGNED_INT
        count=indices.size,
        type="SCALAR",
    )
    gltf.accessors.extend([acc_pos, acc_nor, acc_idx])

    # Material
    mat = Material(
        name=f"{name}_mat",
        pbrMetallicRoughness=PbrMetallicRoughness(
            baseColorFactor=list(base_color_rgba),
            metallicFactor=0.02,
            roughnessFactor=0.55,
        ),
        doubleSided=False,
    )
    gltf.materials.append(mat)

    prim = Primitive(
        attributes={"POSITION": 0, "NORMAL": 1},
        indices=2,
        material=0,
        mode=4,  # TRIANGLES
    )
    mesh = Mesh(primitives=[prim], name=name)
    gltf.meshes.append(mesh)

    node = Node(mesh=0, name=name)
    gltf.nodes.append(node)

    gltf.scenes.append(Scene(nodes=[0], name="Scene"))
    gltf.scene = 0

    # attach binary
    gltf.set_binary_blob(blob)
    return gltf


def save_glb(gltf: GLTF2, filename: str):
    out_path = os.path.join(OUT_DIR, filename)
    gltf.save_binary(out_path)
    print(f"Wrote {out_path}")


# --- geometry builders ---

def build_cube(size=1.6):
    s = size / 2.0
    # 8 vertices
    verts = np.array([
        [-s, -s, -s],
        [ s, -s, -s],
        [ s,  s, -s],
        [-s,  s, -s],
        [-s, -s,  s],
        [ s, -s,  s],
        [ s,  s,  s],
        [-s,  s,  s],
    ], dtype=np.float32)

    # 12 triangles (two per face)
    faces = np.array([
        [0, 1, 2], [0, 2, 3],  # back
        [4, 6, 5], [4, 7, 6],  # front
        [0, 4, 5], [0, 5, 1],  # bottom
        [3, 2, 6], [3, 6, 7],  # top
        [0, 3, 7], [0, 7, 4],  # left
        [1, 5, 6], [1, 6, 2],  # right
    ], dtype=np.uint32)

    return verts, faces


def build_pyramid(radius=1.0, height=1.6):
    # square base on y=0, apex at y=height
    r = radius
    base = np.array([
        [-r, 0, -r],
        [ r, 0, -r],
        [ r, 0,  r],
        [-r, 0,  r],
    ], dtype=np.float32)
    apex = np.array([[0, height, 0]], dtype=np.float32)
    verts = np.vstack([base, apex])

    # base (two triangles) + 4 side triangles
    faces = np.array([
        [0, 2, 1], [0, 3, 2],      # base (winding so normals point down)
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
    ], dtype=np.uint32)
    return verts, faces


def build_cone(radius=1.0, height=1.8, segments=32):
    # base circle on y=0, apex at y=height
    verts = []
    for i in range(segments):
        a = (i / segments) * 2 * math.pi
        verts.append([radius * math.cos(a), 0.0, radius * math.sin(a)])
    base_center_index = len(verts)
    verts.append([0.0, 0.0, 0.0])
    apex_index = len(verts)
    verts.append([0.0, height, 0.0])
    verts = np.array(verts, dtype=np.float32)

    faces = []
    # side triangles
    for i in range(segments):
        j = (i + 1) % segments
        faces.append([i, j, apex_index])
    # base triangles
    for i in range(segments):
        j = (i + 1) % segments
        faces.append([j, i, base_center_index])  # winding so base normal points down

    faces = np.array(faces, dtype=np.uint32)
    return verts, faces


def main():
    # Pink Pyramid
    v, f = build_pyramid(radius=1.0, height=1.6)
    gltf = make_gltf_mesh("pink_pyramid", v, f, base_color_rgba=(1.0, 0.31, 0.85, 1.0))
    save_glb(gltf, "pink_pyramid.glb")

    # Orange Cone
    v, f = build_cone(radius=1.0, height=1.8, segments=32)
    gltf = make_gltf_mesh("orange_cone", v, f, base_color_rgba=(1.0, 0.48, 0.10, 1.0))
    save_glb(gltf, "orange_cone.glb")

    # Light Green Cube
    v, f = build_cube(size=1.6)
    gltf = make_gltf_mesh("light_green_cube", v, f, base_color_rgba=(0.49, 1.0, 0.48, 1.0))
    save_glb(gltf, "light_green_cube.glb")


if __name__ == "__main__":
    main()
