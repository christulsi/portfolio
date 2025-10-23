import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { BLOOM_RADIUS, BLOOM_STRENGTH, BLOOM_THRESHOLD } from './constants';

/**
 * Create and configure the post-processing composer with bloom effect
 * Returns null if post-processing fails to initialize
 */
export function createComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): { composer: EffectComposer; bloomPass: UnrealBloomPass } | null {
  try {
    const composer = new EffectComposer(renderer);

    // Add render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Add bloom pass with conservative settings
    // These settings provide visual enhancement with <15% GPU overhead
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      BLOOM_STRENGTH, // reduced from typical 1.5
      BLOOM_RADIUS, // reduced from typical 0.8
      BLOOM_THRESHOLD // only bright particles
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
