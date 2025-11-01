import {
  DirectionalLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION_Z,
  MAX_PIXEL_RATIO,
} from './constants';

/**
 * Create and configure the Three.js renderer
 */
export function createRenderer(root: HTMLElement): WebGLRenderer {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setSize(root.clientWidth, root.clientHeight);

  // Style the renderer canvas
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  return renderer;
}

/**
 * Create and configure the Three.js scene
 */
export function createScene(): Scene {
  return new Scene();
}

/**
 * Create and configure the camera
 */
export function createCamera(width: number, height: number): PerspectiveCamera {
  const camera = new PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);
  camera.position.z = CAMERA_POSITION_Z;
  return camera;
}

/**
 * Add lighting to the scene
 */
export function addLighting(scene: Scene): void {
  const dirLight = new DirectionalLight(0xffffff, 0.3);
  dirLight.position.set(0, 1, 1);
  scene.add(dirLight);
}

/**
 * Handle window resize events
 */
export function handleResize(
  root: HTMLElement,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer,
  composer: any
): void {
  const w = root.clientWidth;
  const h = root.clientHeight || 300;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  if (composer) {
    composer.setSize(w, h);
  }
}
