/**
 * NEW: Shared state between the motion layer (GSAP + ScrollTrigger) and the
 * lazily loaded three.js scene.
 *
 * Motion writes these values (usually by tweening them directly); the render
 * loop reads them every frame. A plain mutable object keeps per-frame reads
 * free. When the scene renders static frames (reduced motion / data saver),
 * writers dispatch `scene:invalidate` so it can redraw once.
 */
export interface SceneState {
  /** The current page has a hero centerpiece (home page only). */
  hasHero: boolean;
  /** 0 = arrowhead assembled, 1 = scattered into the network (hero scrolled away). */
  heroProgress: number;
  /** 0 = particles still scattered, 1 = arrowhead assembled (intro sequence). */
  assemble: number;
}

export const sceneState: SceneState = {
  hasHero: false,
  heroProgress: 0,
  assemble: 1,
};

/** Ask a static (non-animating) scene to redraw after a state change. */
export function invalidateScene(): void {
  window.dispatchEvent(new CustomEvent('scene:invalidate'));
}
