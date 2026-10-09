/**
 * NEW: The hero centerpiece — the Golden Arrowhead mark (the site logo) built
 * from particles: a gold body inside a contrasting border band, like the
 * flag's fimbriation.
 *
 * It ripples like a flag when idle, tilts toward the pointer and pushes
 * nearby particles aside, assembles from scattered particles during the
 * intro, and scatters back into the background network as the hero scrolls
 * away (both driven through `sceneState`).
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';

import { ARROWHEAD_COLORS, ARROWHEAD_POINT_SIZE, MAX_ARROWHEAD_COUNT } from './constants';
import { arrowheadFragmentShader, arrowheadVertexShader } from './shaders';

/** Logo proportions: the mark is very slightly wider than tall. */
const ASPECT = 1.03;

export interface ArrowheadSample {
  formed: Float32Array;
  scattered: Float32Array;
  kind: Float32Array; // 0 = gold body, 1 = border band
  seed: Float32Array;
  delay: Float32Array; // 0..1, lower peels away first when scattering
  count: number;
}

/**
 * Inward distance from (x, y) to the nearest edge of a right-pointing triangle
 * with vertices (-w/2, h/2), (-w/2, -h/2) and (w/2, 0). Positive inside.
 */
export function edgeDistance(x: number, y: number, w: number, h: number): number {
  const slant = Math.hypot(w, h / 2);
  const left = x + w / 2;
  const top = -((x + w / 2) * (h / 2) + (y - h / 2) * w) / slant;
  const bottom = -((x + w / 2) * (h / 2) - (y + h / 2) * w) / slant;
  return Math.min(left, top, bottom);
}

/**
 * Sample particle positions for the mark. `size` is its height in world
 * units; `edgeShare` is the fraction of particles in the border band.
 */
export function sampleArrowhead(
  count: number,
  size: number,
  { depth = size * 0.04, edgeShare = 0.3, rand = Math.random } = {}
): ArrowheadSample {
  const h = size;
  const w = size * ASPECT;
  const edgeWidth = size * 0.075;
  const edgeCount = Math.round(count * edgeShare);

  const formed = new Float32Array(count * 3);
  const scattered = new Float32Array(count * 3);
  const kind = new Float32Array(count);
  const seed = new Float32Array(count);
  const delay = new Float32Array(count);

  let edges = 0;
  let bodies = 0;
  let guard = count * 200;

  while (edges + bodies < count && guard-- > 0) {
    const x = (rand() - 0.5) * w;
    const y = (rand() - 0.5) * h;
    const d = edgeDistance(x, y, w, h);
    if (d < 0) continue;

    const isEdge = d < edgeWidth;
    if (isEdge ? edges >= edgeCount : bodies >= count - edgeCount) continue;

    const i = edges + bodies;
    if (isEdge) edges++;
    else bodies++;

    const z = (rand() - 0.5) * depth;
    formed[i * 3] = x;
    formed[i * 3 + 1] = y;
    formed[i * 3 + 2] = z;

    // Scatter outward from the mark along a random direction, far enough to
    // read as part of the background network.
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(rand() * 2 - 1);
    const radius = size * (0.9 + rand() * 1.4);
    scattered[i * 3] = x * 1.6 + Math.sin(phi) * Math.cos(theta) * radius;
    scattered[i * 3 + 1] = y * 1.6 + Math.sin(phi) * Math.sin(theta) * radius;
    scattered[i * 3 + 2] = z + Math.cos(phi) * radius * 0.6;

    kind[i] = isEdge ? 1 : 0;
    seed[i] = rand();
    // Peel from the tip back toward the hoist, with some jitter.
    delay[i] = Math.min(1, (0.5 - x / w) * 0.7 + rand() * 0.3);
  }

  return { formed, scattered, kind, seed, delay, count: edges + bodies };
}

export interface ArrowheadLayout {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

/**
 * Where the mark sits for a given visible half-extent (world units at z=0).
 * Landscape: right of the headline, above the info strip. Portrait (phones):
 * behind the name, quieter, so the type stays legible.
 */
export function arrowheadLayout(ext: { x: number; y: number }): ArrowheadLayout {
  const aspect = ext.x / ext.y;
  if (aspect >= 1.15) {
    return { x: ext.x * 0.5, y: ext.y * 0.14, size: ext.y * 0.95, opacity: 1 };
  }
  if (aspect >= 0.8) {
    return { x: ext.x * 0.42, y: ext.y * 0.3, size: ext.y * 0.7, opacity: 0.75 };
  }
  return { x: ext.x * 0.32, y: ext.y * 0.4, size: ext.x * 1.05, opacity: 0.4 };
}

/**
 * Particle budget for the device: fewer on small screens and low-memory
 * hardware. All the work is in the vertex shader, so this scales cheaply.
 */
export function pickArrowheadCount(): number {
  const w = window.innerWidth;
  let count = w >= 1280 ? MAX_ARROWHEAD_COUNT : w >= 900 ? 3400 : w >= 640 ? 2600 : 1500;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory && memory <= 4) count = Math.round(count * 0.6);
  return count;
}

export interface ArrowheadFrame {
  /** Pointer in world space at z = 0, or null when inactive. */
  pointer: Vector3 | null;
  /** Pointer in normalized device coordinates, for tilt. */
  ndcX: number;
  ndcY: number;
  hasHero: boolean;
  heroProgress: number;
  assemble: number;
}

/**
 * Build the arrowhead. Sampled once at unit size and scaled by layout, so a
 * resize only moves/scales the object instead of resampling.
 */
export function createArrowhead(count: number, theme: 'light' | 'dark', pixelRatio: number) {
  const sample = sampleArrowhead(count, 1);

  const geometry = new BufferGeometry();
  // `position` mirrors the formed shape so bounds/culling stay sensible; the
  // shader works from the dedicated attributes.
  geometry.setAttribute('position', new BufferAttribute(sample.formed, 3));
  geometry.setAttribute('aFormed', new BufferAttribute(sample.formed, 3));
  geometry.setAttribute('aScattered', new BufferAttribute(sample.scattered, 3));
  geometry.setAttribute('aKind', new BufferAttribute(sample.kind, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(sample.seed, 1));
  geometry.setAttribute('aDelay', new BufferAttribute(sample.delay, 1));

  const colors = ARROWHEAD_COLORS[theme];
  const target = { body: new Color(colors.body), edge: new Color(colors.edge) };

  const uniforms = {
    uTime: { value: 0 },
    uScatter: { value: 0 },
    uWave: { value: 0 },
    uSize: { value: ARROWHEAD_POINT_SIZE },
    uPixelRatio: { value: pixelRatio },
    uPointer: { value: new Vector3(1e3, 1e3, 0) },
    uPointerStrength: { value: 0 },
    uPointerRadius: { value: 0.22 },
    uColorBody: { value: target.body.clone() },
    uColorEdge: { value: target.edge.clone() },
    uOpacity: { value: 1 },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: arrowheadVertexShader,
    fragmentShader: arrowheadFragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: NormalBlending,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 2;

  let layout: ArrowheadLayout = { x: 0, y: 0, size: 1, opacity: 1 };
  const tilt = { x: 0, y: 0 };
  const local = new Vector3();

  function setLayout(ext: { x: number; y: number }): void {
    layout = arrowheadLayout(ext);
  }

  function setTheme(next: 'light' | 'dark'): void {
    target.body.set(ARROWHEAD_COLORS[next].body);
    target.edge.set(ARROWHEAD_COLORS[next].edge);
  }

  /**
   * Advance one frame. `dt` = 0 renders a still frame (reduced motion): no
   * wave, no pointer, colors snap to the theme.
   */
  function update(dt: number, time: number, frame: ArrowheadFrame): void {
    const still = dt === 0;
    const scatter = Math.max(frame.heroProgress, 1 - frame.assemble);
    const ease = still ? 1 : 1 - Math.exp(-dt * 4);

    points.visible = frame.hasHero && scatter < 0.999;
    if (!points.visible) return;

    // Tilt toward the pointer, sway when idle, spin away as it scatters.
    // Kept small at rest so the triangle always reads as the mark.
    const idle = still ? 0 : Math.sin(time * 0.3) * 0.08;
    const targetY = frame.ndcX * 0.3 + idle + frame.heroProgress * 1.4;
    const targetX = -frame.ndcY * 0.2 + (still ? 0 : Math.cos(time * 0.23) * 0.04);
    tilt.y += (targetY - tilt.y) * ease;
    tilt.x += (targetX - tilt.x) * ease;
    points.rotation.set(tilt.x, tilt.y, frame.heroProgress * 0.4);

    const scale = layout.size * (1 + frame.heroProgress * 0.35);
    points.scale.setScalar(scale);
    points.position.set(layout.x, layout.y + frame.heroProgress * layout.size * 0.3, 0);

    uniforms.uTime.value = still ? 0 : time;
    uniforms.uScatter.value = scatter;
    uniforms.uWave.value = still ? 0 : 0.045;
    uniforms.uOpacity.value = layout.opacity;

    // Pointer → local space (unit-size mark), eased in and out.
    let strength = 0;
    if (frame.pointer && !still) {
      points.updateMatrixWorld();
      local.copy(frame.pointer);
      points.worldToLocal(local);
      uniforms.uPointer.value.copy(local);
      strength = 1;
    }
    uniforms.uPointerStrength.value += (strength - uniforms.uPointerStrength.value) * ease;

    const colorEase = still ? 1 : Math.min(1, dt * 3);
    uniforms.uColorBody.value.lerp(target.body, colorEase);
    uniforms.uColorEdge.value.lerp(target.edge, colorEase);
  }

  function setPixelRatio(ratio: number): void {
    uniforms.uPixelRatio.value = ratio;
  }

  function dispose(): void {
    geometry.dispose();
    material.dispose();
  }

  return { points, setLayout, setTheme, setPixelRatio, update, dispose };
}

export type Arrowhead = ReturnType<typeof createArrowhead>;
