import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION_Z,
  MAX_PIXEL_RATIO,
  MIN_HEIGHT,
} from './constants';

/**
 * Create and configure the Three.js renderer.
 */
export function createRenderer(root: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setSize(root.clientWidth, root.clientHeight || MIN_HEIGHT);
  // Fully transparent clear so the page background (and theme) shows through.
  renderer.setClearColor(0x000000, 0);

  // Style the renderer canvas to fill the (fixed, full-viewport) root.
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  return renderer;
}

/**
 * Create and configure the Three.js scene.
 */
export function createScene(): Scene {
  return new Scene();
}

/**
 * Create and configure the camera.
 */
export function createCamera(width: number, height: number): PerspectiveCamera {
  const camera = new PerspectiveCamera(
    CAMERA_FOV,
    width / (height || MIN_HEIGHT),
    CAMERA_NEAR,
    CAMERA_FAR
  );
  camera.position.z = CAMERA_POSITION_Z;
  return camera;
}

/**
 * Compute the visible half-extents (world units) at a given depth plane.
 * Used to spread the node field across the whole viewport and to project the
 * cursor into world space.
 */
export function getVisibleHalfExtents(
  camera: PerspectiveCamera,
  atZ = 0
): { x: number; y: number } {
  const distance = Math.abs(camera.position.z - atZ);
  const halfHeight = Math.tan((camera.fov * Math.PI) / 180 / 2) * distance;
  const halfWidth = halfHeight * camera.aspect;
  return { x: halfWidth, y: halfHeight };
}

/**
 * Handle viewport resize.
 */
export function handleResize(
  root: HTMLElement,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
): void {
  const w = root.clientWidth;
  const h = root.clientHeight || MIN_HEIGHT;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
