import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { BLOOM_RADIUS, BLOOM_STRENGTH, BLOOM_THRESHOLD } from './constants';

/**
 * Create and configure the post-processing composer with bloom effect
 * Returns null if post-processing fails to initialize
 */
export function createComposer(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  width: number,
  height: number
): { composer: EffectComposer; bloomPass: UnrealBloomPass } | null {
  try {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new Vector2(width, height),
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);

    return { composer, bloomPass };
  } catch (e) {
    console.warn('Bloom effect initialization failed:', e);
    return null;
  }
}

/**
 * Dispose of the composer and bloom pass
 */
export function disposeComposer(
  composer: EffectComposer | null,
  bloomPass: UnrealBloomPass | null
): void {
  try {
    if (composer) {
      composer.dispose();
    }
  } catch (e) {
    console.error('Error disposing composer:', e);
  }

  try {
    if (bloomPass && bloomPass.dispose) {
      bloomPass.dispose();
    }
  } catch (e) {
    console.error('Error disposing bloom pass:', e);
  }
}
