import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  NormalBlending,
  ShaderMaterial,
} from 'three';

import { POINT_SIZE } from './constants';
import type { Cursor, NodeField } from './types';

/**
 * Generate the node field: random positions, drift velocities and per-node
 * seeds, all within the given world-space half-extents. Synchronous because a
 * couple hundred nodes is sub-millisecond work — no worker needed.
 */
export function generateNodes(
  count: number,
  bounds: { x: number; y: number; z: number }
): NodeField {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() * 2 - 1) * bounds.x;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * bounds.y;
    positions[i * 3 + 2] = (Math.random() * 2 - 1) * bounds.z;

    // Random direction; z drifts more slowly to keep depth changes gentle.
    velocities[i * 3 + 0] = Math.random() * 2 - 1;
    velocities[i * 3 + 1] = Math.random() * 2 - 1;
    velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.4;

    seeds[i] = Math.random();
  }

  return { positions, velocities, seeds, count, bounds };
}

/**
 * Build the points geometry. The position attribute is marked dynamic because
 * we rewrite it every frame as the nodes drift; the attribute is returned so the
 * caller can flag `needsUpdate` without re-looking-it-up each frame.
 */
export function createPointsGeometry(field: NodeField): {
  geometry: BufferGeometry;
  positionAttr: BufferAttribute;
} {
  const geometry = new BufferGeometry();

  const positionAttr = new BufferAttribute(field.positions, 3);
  positionAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', positionAttr);

  geometry.setAttribute('aSeed', new BufferAttribute(field.seeds, 1));

  return { geometry, positionAttr };
}

export interface PointsUniforms {
  // Index signature lets the object satisfy three's `{ [uniform: string]: IUniform }`
  // while the named members keep precise types at the call sites.
  [uniform: string]: { value: unknown };
  uTime: { value: number };
  uPointSize: { value: number };
  uColorA: { value: Color };
  uColorB: { value: Color };
  uColorIntensity: { value: number };
}

/**
 * Build the points (node) material.
 */
export function createPointsMaterial(
  colorA: Color,
  colorB: Color,
  vertexShader: string,
  fragmentShader: string
): { material: ShaderMaterial; uniforms: PointsUniforms } {
  const uniforms: PointsUniforms = {
    uTime: { value: 0 },
    uPointSize: { value: POINT_SIZE },
    uColorA: { value: colorA.clone() },
    uColorB: { value: colorB.clone() },
    uColorIntensity: { value: 1.0 },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: NormalBlending,
  });

  return { material, uniforms };
}

/**
 * Preallocated dynamic geometry for the connection lines. We never resize these
 * buffers; instead we rewrite the first `linkCount * 2` vertices each frame and
 * move the draw range.
 */
export interface LineBuffers {
  geometry: BufferGeometry;
  positions: Float32Array;
  alphas: Float32Array;
  positionAttr: BufferAttribute;
  alphaAttr: BufferAttribute;
  maxVertices: number;
}

export function createLineBuffers(maxLinks: number): LineBuffers {
  const maxVertices = maxLinks * 2;
  const positions = new Float32Array(maxVertices * 3);
  const alphas = new Float32Array(maxVertices);

  const geometry = new BufferGeometry();

  const positionAttr = new BufferAttribute(positions, 3);
  positionAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', positionAttr);

  const alphaAttr = new BufferAttribute(alphas, 1);
  alphaAttr.setUsage(DynamicDrawUsage);
  geometry.setAttribute('aLineAlpha', alphaAttr);

  geometry.setDrawRange(0, 0);

  return { geometry, positions, alphas, positionAttr, alphaAttr, maxVertices };
}

export interface LineUniforms {
  [uniform: string]: { value: unknown };
  uLineColor: { value: Color };
  uLineOpacity: { value: number };
}

/**
 * Build the line (connection) material.
 */
export function createLineMaterial(
  lineColor: Color,
  opacity: number,
  vertexShader: string,
  fragmentShader: string
): { material: ShaderMaterial; uniforms: LineUniforms } {
  const uniforms: LineUniforms = {
    uLineColor: { value: lineColor.clone() },
    uLineOpacity: { value: opacity },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: NormalBlending,
  });

  return { material, uniforms };
}

/**
 * Rebuild the connection lines for the current frame.
 *
 * Scans every node pair (O(n²) — trivial for a few hundred nodes) plus the
 * cursor, writing endpoints and a distance-based alpha into the preallocated
 * buffers. Returns the number of vertices written so the caller can set the
 * draw range. Stops early if the buffer fills.
 */
export function computeLinks(
  field: NodeField,
  buffers: LineBuffers,
  linkDistance: number,
  cursor: Cursor,
  cursorLinkDistance: number
): number {
  const { positions, count } = field;
  const { positions: linePositions, alphas: lineAlphas, maxVertices } = buffers;

  const linkDist2 = linkDistance * linkDistance;
  const cursorDist2 = cursorLinkDistance * cursorLinkDistance;

  let v = 0; // vertices written so far

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const ix = positions[i3] ?? 0;
    const iy = positions[i3 + 1] ?? 0;
    const iz = positions[i3 + 2] ?? 0;

    // Node-to-node links.
    for (let j = i + 1; j < count; j++) {
      const j3 = j * 3;
      const jx = positions[j3] ?? 0;
      const jy = positions[j3 + 1] ?? 0;
      const jz = positions[j3 + 2] ?? 0;
      const dx = ix - jx;
      const dy = iy - jy;
      const dz = iz - jz;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < linkDist2) {
        if (v + 2 > maxVertices) return v;
        const alpha = 1 - Math.sqrt(d2) / linkDistance;

        const o = v * 3;
        linePositions[o] = ix;
        linePositions[o + 1] = iy;
        linePositions[o + 2] = iz;
        linePositions[o + 3] = jx;
        linePositions[o + 4] = jy;
        linePositions[o + 5] = jz;

        lineAlphas[v] = alpha;
        lineAlphas[v + 1] = alpha;
        v += 2;
      }
    }

    // Cursor link — brighter than node-to-node so the pointer "draws in" nearby
    // nodes.
    if (cursor.active) {
      const dx = ix - cursor.x;
      const dy = iy - cursor.y;
      const dz = iz - cursor.z;
      const d2 = dx * dx + dy * dy + dz * dz;

      if (d2 < cursorDist2) {
        if (v + 2 > maxVertices) return v;
        const alpha = Math.min(1, (1 - Math.sqrt(d2) / cursorLinkDistance) * 1.7);

        const o = v * 3;
        linePositions[o] = ix;
        linePositions[o + 1] = iy;
        linePositions[o + 2] = iz;
        linePositions[o + 3] = cursor.x;
        linePositions[o + 4] = cursor.y;
        linePositions[o + 5] = cursor.z;

        lineAlphas[v] = alpha;
        lineAlphas[v + 1] = alpha;
        v += 2;
      }
    }
  }

  return v;
}
