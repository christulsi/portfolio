import type * as THREE from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import type { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface ThreeConfig {
  particleCount: number;
  pointSize: number;
  enableBloom: boolean;
  enablePointer: boolean;
}

export interface ThreeState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  material: THREE.ShaderMaterial;
  composer: EffectComposer | null;
  bloomPass: UnrealBloomPass | null;
  rafId: number | null;
  worker: Worker | null;
  isVisible: boolean;
  bloomEnabled: boolean;
}

export interface ColorScheme {
  a: THREE.Color;
  b: THREE.Color;
}

export interface PerformanceMetrics {
  fpsFrameCount: number;
  fpsLastTime: number;
  currentFPS: number;
  lowFPSCount: number;
}

export interface InteractionState {
  pointerX: number;
  pointerY: number;
  targetRotY: number;
  targetRotX: number;
  scrollProgress: number;
  scrollTicking: boolean;
}

export interface ColorState {
  targetColorA: THREE.Color;
  targetColorB: THREE.Color;
  currentColorA: THREE.Color;
  currentColorB: THREE.Color;
}
