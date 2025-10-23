/**
 * Three.js Hero Animation
 * Modular architecture for the particle animation background
 */

import * as THREE from 'three';

import {
  ANIMATION_SPEED,
  AUTO_ROTATION_X_AMPLITUDE,
  AUTO_ROTATION_Y_SPEED,
  COLOR_LERP_SPEED,
  ROTATION_LERP_SPEED,
  SCROLL_COLOR_INTENSITY_MIN,
  SCROLL_COLOR_INTENSITY_RANGE,
} from './constants';
import {
  createPointerLeaveHandler,
  createPointerMoveHandler,
  createScrollHandler,
  createVisibilityObserver,
  initializeInteractionState,
} from './controls';
import { addLighting, createCamera, createRenderer, createScene, handleResize } from './core';
import { createComposer, disposeComposer } from './effects';
import {
  createParticleGeometry,
  createParticleMaterial,
  generateParticlePositions,
} from './particles';
import { initializePerformanceMetrics, updateFPS } from './performance';
import { fragmentShader, vertexShader } from './shaders';
import { getColorScheme, initializeColorState, lerpColors, watchThemeChanges } from './theme';
import { isDataSaverEnabled, shouldEnablePointer } from './utils';

/**
 * Main initialization function for the Three.js hero animation
 */
export default function initThreeHero(): void {
  const root = document.getElementById('three-root');
  if (!root) return;

  // Prevent double initialization
  if (root.dataset._threeInited) return;
  root.dataset._threeInited = '1';

  // Create renderer and append to DOM
  const renderer = createRenderer(root);
  root.appendChild(renderer.domElement);

  // Create scene, camera, and lighting
  const scene = createScene();
  const camera = createCamera(root.clientWidth, root.clientHeight);
  addLighting(scene);

  // Create particle system
  const geometry = createParticleGeometry();
  const initialColors = getColorScheme();
  const material = createParticleMaterial(
    initialColors.a,
    initialColors.b,
    vertexShader,
    fragmentShader
  );

  // Generate particle positions (async with worker or sync fallback)
  const worker = generateParticlePositions(geometry);

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Create post-processing composer with bloom effect
  const composerResult = createComposer(
    renderer,
    scene,
    camera,
    root.clientWidth,
    root.clientHeight
  );

  const composer = composerResult?.composer || null;
  const bloomPass = composerResult?.bloomPass || null;
  let bloomEnabled = Boolean(composerResult);

  // Initialize state
  let frame = 0;
  let rafId: number | null = null;
  const enabledPointer = shouldEnablePointer();
  const interactionState = initializeInteractionState();
  const performanceMetrics = initializePerformanceMetrics();
  const colorState = initializeColorState();

  // Setup event listeners
  const cleanupPointerListeners: (() => void) | null = enabledPointer
    ? (() => {
        const onPointerMove = createPointerMoveHandler(root, interactionState);
        const onPointerLeave = createPointerLeaveHandler(interactionState);
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('pointerleave', onPointerLeave);
        return () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerleave', onPointerLeave);
        };
      })()
    : null;

  const onScroll = createScrollHandler(interactionState);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Watch for theme changes
  const themeObserver = watchThemeChanges(colorState, () => {
    // Theme changed callback (currently empty, colors update automatically)
  });

  // Visibility observer for pause/resume
  const visibilityObserver = createVisibilityObserver(
    root,
    () => start(), // Resume when visible
    () => stop() // Pause when hidden
  );

  // Resize handler
  const onResize = () => {
    handleResize(root, camera, renderer, composer);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // DOM mutation observer for cleanup
  const domObserver = new MutationObserver(() => {
    if (!document.body.contains(root)) {
      dispose();
      domObserver.disconnect();
    }
  });
  domObserver.observe(document.body, { childList: true, subtree: true });

  /**
   * Main animation loop
   */
  function animate(): void {
    frame += ANIMATION_SPEED;

    // Calculate automatic rotation
    const autoY = frame * AUTO_ROTATION_Y_SPEED;
    const autoX = Math.sin(frame * AUTO_ROTATION_Y_SPEED) * AUTO_ROTATION_X_AMPLITUDE;

    // Smooth rotation interpolation
    points.rotation.y +=
      (autoY + interactionState.targetRotY - points.rotation.y) * ROTATION_LERP_SPEED;
    points.rotation.x +=
      (autoX + interactionState.targetRotX - points.rotation.x) * ROTATION_LERP_SPEED;

    // Smooth color transitions
    lerpColors(colorState, COLOR_LERP_SPEED);

    // Update shader uniforms
    if (material && material.uniforms) {
      if (material.uniforms.uTime) {
        material.uniforms.uTime.value = performance.now() * 0.001;
      }
      if (material.uniforms.uColorA) {
        material.uniforms.uColorA.value.copy(colorState.currentColorA);
      }
      if (material.uniforms.uColorB) {
        material.uniforms.uColorB.value.copy(colorState.currentColorB);
      }

      // Scroll-based color intensity (brighter as you scroll down)
      const colorIntensity =
        SCROLL_COLOR_INTENSITY_MIN + interactionState.scrollProgress * SCROLL_COLOR_INTENSITY_RANGE;
      if (material.uniforms.uColorIntensity) {
        material.uniforms.uColorIntensity.value = colorIntensity;
      }

      // Scroll-based morphing (sphere at top → torus at bottom)
      if (material.uniforms.uMorphFactor) {
        material.uniforms.uMorphFactor.value = interactionState.scrollProgress;
      }
    }

    // FPS monitoring and performance degradation
    bloomEnabled = updateFPS(performanceMetrics, bloomEnabled);

    // Render with or without bloom
    if (composer && bloomEnabled) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }

    rafId = requestAnimationFrame(animate);
  }

  /**
   * Start animation
   */
  function start(): void {
    if (!rafId) {
      rafId = requestAnimationFrame(animate);
    }
  }

  /**
   * Stop animation
   */
  function stop(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /**
   * Dispose and cleanup all resources
   */
  function dispose(): void {
    // Stop animation
    stop();

    // Terminate worker
    if (worker) {
      try {
        worker.terminate();
      } catch (e) {
        console.error('Error terminating worker:', e);
      }
    }

    // Dispose renderer
    try {
      if (renderer) {
        renderer.forceContextLoss?.();
        renderer.dispose?.();
      }
    } catch (e) {
      console.error('Error disposing renderer:', e);
    }

    // Remove canvas from DOM
    if (renderer?.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    // Dispose geometry and material
    try {
      geometry.dispose?.();
    } catch (e) {
      console.error('Error disposing geometry:', e);
    }
    try {
      material.dispose?.();
    } catch (e) {
      console.error('Error disposing material:', e);
    }

    // Dispose composer and bloom
    disposeComposer(composer, bloomPass);

    // Cleanup event listeners
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    if (cleanupPointerListeners) {
      cleanupPointerListeners();
    }

    // Disconnect observers
    try {
      themeObserver.disconnect();
    } catch (e) {
      console.error('Error disconnecting theme observer:', e);
    }
    try {
      visibilityObserver.disconnect();
    } catch (e) {
      console.error('Error disconnecting visibility observer:', e);
    }

    if (root) {
      root.dataset._threeInited = '';
    }
  }

  // Expose controls to window for external access
  (window as any).startThree = start;
  (window as any).stopThree = stop;
  (window as any).disposeThree = dispose;

  // Listen for custom toggle event
  window.addEventListener('three:toggle', (ev: any) => {
    const disabled = ev?.detail?.disabled === true;
    if (disabled) {
      stop();
    } else {
      start();
    }
  });

  // Handle data saver mode
  if (isDataSaverEnabled()) {
    stop();
    renderer.render(scene, camera); // Render single frame
  } else {
    // Start animation
    start();
  }
}

// Auto-initialize when module is imported
try {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => initThreeHero?.());
  } else {
    initThreeHero?.();
  }
} catch (e) {
  console.error('Error initializing Three.js:', e);
}
