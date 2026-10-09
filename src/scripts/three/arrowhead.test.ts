import { afterEach, describe, expect, it } from 'vitest';

import {
  arrowheadLayout,
  createArrowhead,
  edgeDistance,
  pickArrowheadCount,
  sampleArrowhead,
} from './arrowhead';
import { MAX_ARROWHEAD_COUNT } from './constants';

/** Deterministic PRNG (mulberry32) so sampling tests are reproducible. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function define(obj: object, prop: string, value: unknown): void {
  Object.defineProperty(obj, prop, { value, configurable: true, writable: true });
}

describe('edgeDistance', () => {
  const w = 2;
  const h = 2;

  it('is positive inside, zero on an edge, negative outside', () => {
    expect(edgeDistance(-0.5, 0, w, h)).toBeGreaterThan(0);
    expect(edgeDistance(-1, 0, w, h)).toBeCloseTo(0);
    expect(edgeDistance(-1.5, 0, w, h)).toBeLessThan(0);
  });

  it('treats the tip and the hoist corners as on the boundary', () => {
    expect(edgeDistance(1, 0, w, h)).toBeCloseTo(0);
    expect(edgeDistance(-1, 1, w, h)).toBeCloseTo(0);
    expect(edgeDistance(-1, -1, w, h)).toBeCloseTo(0);
  });

  it('is symmetric about the horizontal axis', () => {
    expect(edgeDistance(0, 0.3, w, h)).toBeCloseTo(edgeDistance(0, -0.3, w, h));
  });
});

describe('sampleArrowhead', () => {
  const size = 10;
  const sample = sampleArrowhead(2000, size, { edgeShare: 0.3, rand: seeded(7) });

  it('fills the requested count', () => {
    expect(sample.count).toBe(2000);
    expect(sample.formed).toHaveLength(6000);
  });

  it('places every formed particle inside the mark', () => {
    for (let i = 0; i < sample.count; i++) {
      const d = edgeDistance(
        sample.formed[i * 3] ?? 0,
        sample.formed[i * 3 + 1] ?? 0,
        size * 1.03,
        size
      );
      expect(d).toBeGreaterThanOrEqual(0);
    }
  });

  it('splits particles between the border band and the body', () => {
    const edges = Array.from(sample.kind).filter((k) => k === 1).length;
    expect(edges).toBe(600);
  });

  it('puts border particles nearer the edge than body particles', () => {
    let maxEdge = 0;
    let minBody = Infinity;
    for (let i = 0; i < sample.count; i++) {
      const d = edgeDistance(
        sample.formed[i * 3] ?? 0,
        sample.formed[i * 3 + 1] ?? 0,
        size * 1.03,
        size
      );
      if (sample.kind[i] === 1) maxEdge = Math.max(maxEdge, d);
      else minBody = Math.min(minBody, d);
    }
    expect(maxEdge).toBeLessThanOrEqual(minBody);
  });

  it('scatters particles away from their formed positions', () => {
    let total = 0;
    for (let i = 0; i < sample.count; i++) {
      const dx = (sample.scattered[i * 3] ?? 0) - (sample.formed[i * 3] ?? 0);
      const dy = (sample.scattered[i * 3 + 1] ?? 0) - (sample.formed[i * 3 + 1] ?? 0);
      total += Math.hypot(dx, dy);
    }
    expect(total / sample.count).toBeGreaterThan(size * 0.5);
  });

  it('keeps delays within 0..1', () => {
    expect(Math.min(...sample.delay)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...sample.delay)).toBeLessThanOrEqual(1);
  });
});

describe('arrowheadLayout', () => {
  it('sits right of the headline on landscape screens', () => {
    const layout = arrowheadLayout({ x: 64, y: 40 });
    expect(layout.x).toBeGreaterThan(0);
    expect(layout.opacity).toBe(1);
    // Leaves the left half of the screen to the text.
    expect(layout.x - (layout.size * 1.03) / 2).toBeGreaterThan(0);
  });

  it('is quieter and stays on screen for portrait phones', () => {
    const layout = arrowheadLayout({ x: 18, y: 40 });
    expect(layout.opacity).toBeLessThan(1);
    expect(layout.x + (layout.size * 1.03) / 2).toBeLessThanOrEqual(18 * 1.2);
  });
});

describe('pickArrowheadCount', () => {
  afterEach(() => {
    define(window, 'innerWidth', 1024);
    define(navigator, 'deviceMemory', undefined);
  });

  it('uses the full budget on large screens', () => {
    define(window, 'innerWidth', 1440);
    expect(pickArrowheadCount()).toBe(MAX_ARROWHEAD_COUNT);
  });

  it('uses a lighter budget on phones', () => {
    define(window, 'innerWidth', 390);
    expect(pickArrowheadCount()).toBe(1500);
  });

  it('scales down on low-memory devices', () => {
    define(window, 'innerWidth', 1440);
    define(navigator, 'deviceMemory', 2);
    expect(pickArrowheadCount()).toBe(Math.round(MAX_ARROWHEAD_COUNT * 0.6));
  });
});

describe('createArrowhead', () => {
  const frame = {
    pointer: null,
    ndcX: 0,
    ndcY: 0,
    hasHero: true,
    heroProgress: 0,
    assemble: 1,
  };

  it('is hidden on pages without a hero', () => {
    const arrowhead = createArrowhead(200, 'light', 1);
    arrowhead.update(0, 0, { ...frame, hasHero: false });
    expect(arrowhead.points.visible).toBe(false);
    arrowhead.dispose();
  });

  it('hides once fully scattered and shows while assembled', () => {
    const arrowhead = createArrowhead(200, 'dark', 1);
    arrowhead.update(0, 0, frame);
    expect(arrowhead.points.visible).toBe(true);
    arrowhead.update(0, 0, { ...frame, heroProgress: 1 });
    expect(arrowhead.points.visible).toBe(false);
    arrowhead.dispose();
  });

  it('scatters while the intro has not assembled it yet', () => {
    const arrowhead = createArrowhead(200, 'light', 1);
    arrowhead.update(0, 0, { ...frame, assemble: 0.25 });
    const material = arrowhead.points.material as unknown as {
      uniforms: { uScatter: { value: number } };
    };
    expect(material.uniforms.uScatter.value).toBeCloseTo(0.75);
    arrowhead.dispose();
  });

  it('places itself from the layout', () => {
    const arrowhead = createArrowhead(200, 'light', 1);
    arrowhead.setLayout({ x: 64, y: 40 });
    arrowhead.update(0, 0, frame);
    expect(arrowhead.points.position.x).toBeCloseTo(32);
    expect(arrowhead.points.scale.x).toBeCloseTo(38);
    arrowhead.dispose();
  });
});
