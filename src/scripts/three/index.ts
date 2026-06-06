/**
 * Three.js Constellation Background
 *
 * A site-wide network of drifting nodes connected by distance-faded lines.
 * Lives in a fixed, full-viewport canvas behind the page content. Designed to
 * be cheap (pauses when the tab is hidden, auto-degrades on low FPS) and
 * accessible (renders a single static frame when the user prefers reduced
 * motion).
 */

import { Group, LineSegments, Points } from 'three';

import {
  COLOR_LERP_SPEED,
  CURSOR_LINK_DISTANCE,
  LINK_DISTANCE,
  LINK_OPACITY,
  MAX_LINKS_PER_NODE,
  NODE_DEPTH,
  NODE_DRIFT_SPEED,
  NODE_MARGIN,
  PARALLAX_AMOUNT,
  PARALLAX_LERP,
  POINTER_ATTRACT,
  POINTER_MOVE_EPSILON,
  SCROLL_COLOR_INTENSITY_MIN,
  SCROLL_COLOR_INTENSITY_RANGE,
  SCROLL_ROTATION,
  MAX_DELTA,
} from './constants';
import {
  createPointerLeaveHandler,
  createPointerMoveHandler,
  createScrollHandler,
  initializeInteractionState,
  updateScrollProgress,
} from './controls';
import {
  createCamera,
  createRenderer,
  createScene,
  getVisibleHalfExtents,
  handleResize,
} from './core';
import {
  computeLinks,
  createLineBuffers,
  createLineMaterial,
  createPointsGeometry,
  createPointsMaterial,
  generateNodes,
} from './particles';
import { fragmentShader, lineFragmentShader, lineVertexShader, vertexShader } from './shaders';
import { getColorScheme, initializeColorState, lerpColors, watchThemeChanges } from './theme';
import type { Cursor } from './types';
import {
  clamp,
  getCurrentTheme,
  isDataSaverEnabled,
  pickNodeCount,
  prefersReducedMotion,
  shouldEnablePointer,
} from './utils';

/**
 * Main initialization for the constellation background.
 */
export default function initThreeHero(): void {
  const root = document.getElementById('three-root');
  if (!root) return;

  // Prevent double initialization (the root persists across client-side
  // navigations via `transition:persist`).
  if (root.dataset._threeInited) return;
  root.dataset._threeInited = '1';

  // --- Renderer / scene / camera ------------------------------------------
  const renderer = createRenderer(root);
  root.appendChild(renderer.domElement);

  const scene = createScene();
  const camera = createCamera(root.clientWidth, root.clientHeight);

  // --- Node field ----------------------------------------------------------
  const extents = getVisibleHalfExtents(camera);
  const nodeCount = pickNodeCount();
  const field = generateNodes(nodeCount, {
    x: extents.x * NODE_MARGIN,
    y: extents.y * NODE_MARGIN,
    z: NODE_DEPTH,
  });

  const theme = getCurrentTheme();
  const initialColors = getColorScheme(theme);

  const { geometry: pointsGeometry, positionAttr: pointsPositionAttr } =
    createPointsGeometry(field);
  const { material: pointsMaterial, uniforms: pointsUniforms } = createPointsMaterial(
    initialColors.a,
    initialColors.b,
    vertexShader,
    fragmentShader
  );
  const points = new Points(pointsGeometry, pointsMaterial);

  // --- Connection lines ----------------------------------------------------
  const lineBuffers = createLineBuffers(nodeCount * MAX_LINKS_PER_NODE);
  const { material: lineMaterial, uniforms: lineUniforms } = createLineMaterial(
    initialColors.a,
    LINK_OPACITY[theme],
    lineVertexShader,
    lineFragmentShader
  );
  const lines = new LineSegments(lineBuffers.geometry, lineMaterial);

  // Group so pointer parallax + scroll tilt move points and lines together.
  const group = new Group();
  group.add(lines);
  group.add(points);
  scene.add(group);

  // --- State ---------------------------------------------------------------
  let rafId: number | null = null;
  let lastTime = performance.now();
  let userDisabled = false;
  let prevNdcX = 0;
  let prevNdcY = 0;

  const reduceMotion = prefersReducedMotion();
  const staticOnly = reduceMotion || isDataSaverEnabled();
  const enablePointer = shouldEnablePointer() && !staticOnly;

  const interactionState = initializeInteractionState();
  const colorState = initializeColorState();
  const cursor: Cursor = { x: 0, y: 0, z: 0, active: false };

  // --- Helpers -------------------------------------------------------------

  /** Project the pointer (NDC) into world space at the z=0 plane. */
  function projectCursor(): void {
    if (!enablePointer || !interactionState.pointerActive) {
      cursor.active = false;
      return;
    }
    const ext = getVisibleHalfExtents(camera);
    cursor.x = interactionState.ndcX * ext.x - group.position.x;
    cursor.y = interactionState.ndcY * ext.y - group.position.y;
    cursor.z = 0;
    cursor.active = true;
  }

  /** Advance node positions: drift, bounce off bounds, gentle cursor pull. */
  function updateNodes(dt: number, pointerMoving: boolean): void {
    const { positions, velocities, count, bounds } = field;
    const drift = NODE_DRIFT_SPEED * dt;
    const r = CURSOR_LINK_DISTANCE;
    const r2 = r * r;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = ix + 1;
      const iz = ix + 2;

      let px = positions[ix] ?? 0;
      let py = positions[iy] ?? 0;
      let pz = positions[iz] ?? 0;
      let vx = velocities[ix] ?? 0;
      let vy = velocities[iy] ?? 0;
      let vz = velocities[iz] ?? 0;

      px += vx * drift;
      py += vy * drift;
      pz += vz * drift;

      // Bounce at the box bounds.
      if (px > bounds.x) {
        px = bounds.x;
        vx = -vx;
      } else if (px < -bounds.x) {
        px = -bounds.x;
        vx = -vx;
      }
      if (py > bounds.y) {
        py = bounds.y;
        vy = -vy;
      } else if (py < -bounds.y) {
        py = -bounds.y;
        vy = -vy;
      }
      if (pz > bounds.z) {
        pz = bounds.z;
        vz = -vz;
      } else if (pz < -bounds.z) {
        pz = -bounds.z;
        vz = -vz;
      }

      // Gentle attraction toward the cursor for nearby nodes — only while the
      // pointer is moving, so a resting cursor doesn't collapse nodes into a knot.
      if (cursor.active && pointerMoving) {
        const dx = cursor.x - px;
        const dy = cursor.y - py;
        const dz = cursor.z - pz;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < r2) {
          const pull = POINTER_ATTRACT * (1 - Math.sqrt(d2) / r) * dt;
          px += dx * pull;
          py += dy * pull;
          pz += dz * pull;
        }
      }

      positions[ix] = px;
      positions[iy] = py;
      positions[iz] = pz;
      velocities[ix] = vx;
      velocities[iy] = vy;
      velocities[iz] = vz;
    }

    pointsPositionAttr.needsUpdate = true;
  }

  /** Rebuild the connection line buffers for the current node positions. */
  function updateLinks(): void {
    const vertexCount = computeLinks(
      field,
      lineBuffers,
      LINK_DISTANCE,
      cursor,
      CURSOR_LINK_DISTANCE
    );
    lineBuffers.geometry.setDrawRange(0, vertexCount);
    lineBuffers.positionAttr.needsUpdate = true;
    lineBuffers.alphaAttr.needsUpdate = true;
  }

  /** Push current colors + scroll intensity into the material uniforms. */
  function syncColors(elapsed: number): void {
    pointsUniforms.uColorA.value.copy(colorState.currentColorA);
    pointsUniforms.uColorB.value.copy(colorState.currentColorB);
    pointsUniforms.uTime.value = elapsed;

    const intensity =
      SCROLL_COLOR_INTENSITY_MIN + interactionState.scrollProgress * SCROLL_COLOR_INTENSITY_RANGE;
    pointsUniforms.uColorIntensity.value = intensity;

    lineUniforms.uLineColor.value.copy(colorState.currentColorA);
  }

  function render(): void {
    renderer.render(scene, camera);
  }

  // --- Animation loop ------------------------------------------------------
  function animate(): void {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, MAX_DELTA);
    lastTime = now;

    const pointerMoving =
      Math.abs(interactionState.ndcX - prevNdcX) + Math.abs(interactionState.ndcY - prevNdcY) >
      POINTER_MOVE_EPSILON;
    prevNdcX = interactionState.ndcX;
    prevNdcY = interactionState.ndcY;

    projectCursor();
    updateNodes(dt, pointerMoving);

    // Eased pointer parallax + scroll tilt on the whole group.
    interactionState.parallaxX +=
      (interactionState.ndcX * PARALLAX_AMOUNT - interactionState.parallaxX) * PARALLAX_LERP;
    interactionState.parallaxY +=
      (interactionState.ndcY * PARALLAX_AMOUNT - interactionState.parallaxY) * PARALLAX_LERP;
    group.position.x = interactionState.parallaxX;
    group.position.y = interactionState.parallaxY;
    group.rotation.z = (interactionState.scrollProgress - 0.5) * SCROLL_ROTATION;

    lerpColors(colorState, COLOR_LERP_SPEED);
    syncColors(now * 0.001);

    updateLinks();
    render();

    rafId = requestAnimationFrame(animate);
  }

  /** Render a single static frame (reduced motion / data saver). */
  function renderStaticFrame(): void {
    cursor.active = false;
    colorState.currentColorA.copy(colorState.targetColorA);
    colorState.currentColorB.copy(colorState.targetColorB);
    group.rotation.z = (interactionState.scrollProgress - 0.5) * SCROLL_ROTATION;
    syncColors(0);
    pointsPositionAttr.needsUpdate = true;
    updateLinks();
    render();
  }

  function start(): void {
    if (staticOnly || userDisabled || document.hidden || rafId !== null) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(animate);
  }

  function stop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // --- Event listeners -----------------------------------------------------
  const cleanupPointer = enablePointer
    ? (() => {
        const onMove = createPointerMoveHandler(interactionState);
        const onLeave = createPointerLeaveHandler(interactionState);
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
        return () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerleave', onLeave);
        };
      })()
    : null;

  const onScroll = createScrollHandler(interactionState);
  if (!staticOnly) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const themeObserver = watchThemeChanges(colorState, () => {
    lineUniforms.uLineOpacity.value = LINK_OPACITY[getCurrentTheme()];
    if (staticOnly) renderStaticFrame();
  });

  const onResize = (): void => {
    handleResize(root, camera, renderer);
    const ext = getVisibleHalfExtents(camera);
    field.bounds.x = ext.x * NODE_MARGIN;
    field.bounds.y = ext.y * NODE_MARGIN;
    const { positions, count, bounds } = field;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = clamp(positions[i * 3] ?? 0, -bounds.x, bounds.x);
      positions[i * 3 + 1] = clamp(positions[i * 3 + 1] ?? 0, -bounds.y, bounds.y);
    }
    if (staticOnly) renderStaticFrame();
  };
  window.addEventListener('resize', onResize, { passive: true });

  const onVisibilityChange = (): void => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  // External callers can pause/resume by dispatching `three:toggle`.
  const onToggle = (ev: Event): void => {
    const { detail } = ev as CustomEvent<{ disabled?: boolean }>;
    userDisabled = detail?.disabled === true;
    if (userDisabled) {
      stop();
    } else {
      start();
    }
  };
  window.addEventListener('three:toggle', onToggle);

  // --- Cleanup -------------------------------------------------------------
  function dispose(): void {
    stop();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('three:toggle', onToggle);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    cleanupPointer?.();

    try {
      themeObserver.disconnect();
    } catch (e) {
      console.error('Error disconnecting theme observer:', e);
    }

    try {
      renderer.forceContextLoss?.();
      renderer.dispose?.();
    } catch (e) {
      console.error('Error disposing renderer:', e);
    }
    if (renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }

    pointsGeometry.dispose();
    pointsMaterial.dispose();
    lineBuffers.geometry.dispose();
    lineMaterial.dispose();

    if (root) root.dataset._threeInited = '';
  }
  window.addEventListener('pagehide', dispose, { once: true });

  // --- Kick off ------------------------------------------------------------
  // Seed scroll progress so the initial frame reflects the current position.
  updateScrollProgress(interactionState);
  if (staticOnly) {
    renderStaticFrame();
  } else {
    start();
  }
}

// Auto-initialize when the module is imported.
try {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => initThreeHero());
  } else {
    initThreeHero();
  }
} catch (e) {
  console.error('Error initializing Three.js constellation:', e);
}
