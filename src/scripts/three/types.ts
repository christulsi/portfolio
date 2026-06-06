import type * as THREE from 'three';

/**
 * The drifting node field. `positions` and `velocities` are flat xyz arrays
 * (length count*3); `positions` is mutated in place each frame and uploaded to
 * the GPU.
 */
export interface NodeField {
  positions: Float32Array;
  velocities: Float32Array;
  seeds: Float32Array;
  count: number;
  bounds: { x: number; y: number; z: number };
}

/**
 * Cursor projected into world space at the z=0 plane. Drives both the
 * cursor-link lines and the gentle attraction of nearby nodes.
 */
export interface Cursor {
  x: number;
  y: number;
  z: number;
  active: boolean;
}

export interface ColorScheme {
  a: THREE.Color;
  b: THREE.Color;
}

/**
 * Pointer/scroll interaction state. Pointer is tracked in normalized device
 * coordinates (-1..1) so it can be reprojected to world space after any resize.
 */
export interface InteractionState {
  ndcX: number;
  ndcY: number;
  pointerActive: boolean;
  parallaxX: number;
  parallaxY: number;
  scrollProgress: number;
  scrollTicking: boolean;
}

export interface ColorState {
  targetColorA: THREE.Color;
  targetColorB: THREE.Color;
  currentColorA: THREE.Color;
  currentColorB: THREE.Color;
}
