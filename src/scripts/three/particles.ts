import * as THREE from 'three';

import { PARTICLE_COUNT, SPHERE_RADIUS, TORUS_MAJOR_RADIUS, TORUS_MINOR_RADIUS } from './constants';
import { generateCloud, generateFibonacciSphere, generateSeedArray, generateTorus } from './utils';

/**
 * Generate particle positions using a Web Worker for better performance
 * Falls back to synchronous generation if Worker is not available
 */
export function generateParticlePositions(geometry: THREE.BufferGeometry): Worker | null {
  let worker: Worker | null = null;
  const useWorker = typeof Worker !== 'undefined';

  if (useWorker) {
    try {
      worker = new Worker(new URL('../three-hero-worker.js', import.meta.url), { type: 'module' });

      worker.postMessage({ particleCount: PARTICLE_COUNT });

      worker.addEventListener('message', (ev) => {
        const buf = ev.data?.positions;
        const sphereBuf = ev.data?.spherePositions;
        const torusBuf = ev.data?.torusPositions;

        if (buf) {
          const positions = new Float32Array(buf);
          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        }

        if (sphereBuf) {
          const spherePositions = new Float32Array(sphereBuf);
          geometry.setAttribute('aSpherePosition', new THREE.BufferAttribute(spherePositions, 3));
        }

        if (torusBuf) {
          const torusPositions = new Float32Array(torusBuf);
          geometry.setAttribute('aTorusPosition', new THREE.BufferAttribute(torusPositions, 3));
        }
      });

      return worker;
    } catch (e) {
      console.warn('Worker initialization failed, using fallback', e);
      worker = null;
    }
  }

  // Fallback: generate positions synchronously
  generateParticlePositionsFallback(geometry);
  return null;
}

/**
 * Fallback method to generate particle positions synchronously
 */
function generateParticlePositionsFallback(geometry: THREE.BufferGeometry): void {
  // Generate cloud positions
  const positions = generateCloud(PARTICLE_COUNT);
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Generate sphere positions (Fibonacci sphere)
  const spherePositions = generateFibonacciSphere(PARTICLE_COUNT, SPHERE_RADIUS);
  geometry.setAttribute('aSpherePosition', new THREE.BufferAttribute(spherePositions, 3));

  // Generate torus positions
  const torusPositions = generateTorus(PARTICLE_COUNT, TORUS_MAJOR_RADIUS, TORUS_MINOR_RADIUS);
  geometry.setAttribute('aTorusPosition', new THREE.BufferAttribute(torusPositions, 3));
}

/**
 * Create and configure the particle geometry
 */
export function createParticleGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  // Add per-particle seed attribute for randomization
  const seedArray = generateSeedArray(PARTICLE_COUNT);
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seedArray, 1));

  return geometry;
}

/**
 * Create the particle material with shader uniforms
 */
export function createParticleMaterial(
  colorA: THREE.Color,
  colorB: THREE.Color,
  vertexShader: string,
  fragmentShader: string
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPointSize: { value: 1.6 },
      uColorA: { value: colorA.clone() },
      uColorB: { value: colorB.clone() },
      uColorIntensity: { value: 1.0 },
      uMorphFactor: { value: 0.0 }, // 0 = sphere, 1 = torus
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
}
