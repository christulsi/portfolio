import { Color } from 'three';
import { describe, expect, it } from 'vitest';

import {
  computeLinks,
  createLineBuffers,
  createLineMaterial,
  createPointsGeometry,
  createPointsMaterial,
  generateNodes,
} from './particles';
import { fragmentShader, lineFragmentShader, lineVertexShader, vertexShader } from './shaders';
import type { Cursor, NodeField } from './types';

describe('generateNodes', () => {
  it('produces correctly sized, in-bounds arrays', () => {
    const bounds = { x: 50, y: 30, z: 20 };
    const field = generateNodes(40, bounds);

    expect(field.count).toBe(40);
    expect(field.positions).toHaveLength(120);
    expect(field.velocities).toHaveLength(120);
    expect(field.seeds).toHaveLength(40);

    for (let i = 0; i < field.count; i++) {
      expect(Math.abs(field.positions[i * 3] ?? 0)).toBeLessThanOrEqual(bounds.x);
      expect(Math.abs(field.positions[i * 3 + 1] ?? 0)).toBeLessThanOrEqual(bounds.y);
      expect(Math.abs(field.positions[i * 3 + 2] ?? 0)).toBeLessThanOrEqual(bounds.z);
    }
    for (const seed of field.seeds) {
      expect(seed).toBeGreaterThanOrEqual(0);
      expect(seed).toBeLessThan(1);
    }
  });
});

function fieldFrom(points: number[][]): NodeField {
  return {
    positions: new Float32Array(points.flat()),
    velocities: new Float32Array(points.length * 3),
    seeds: new Float32Array(points.length),
    count: points.length,
    bounds: { x: 1000, y: 1000, z: 1000 },
  };
}

describe('computeLinks', () => {
  const inactiveCursor: Cursor = { x: 0, y: 0, z: 0, active: false };

  it('links only pairs within the distance and fades by distance', () => {
    const field = fieldFrom([
      [0, 0, 0],
      [10, 0, 0],
      [100, 0, 0],
    ]);
    const buffers = createLineBuffers(16);

    const vertices = computeLinks(field, buffers, 20, inactiveCursor, 30);

    expect(vertices).toBe(2); // a single A–B segment
    expect(buffers.positions[0]).toBe(0);
    expect(buffers.positions[3]).toBe(10);
    expect(buffers.alphas[0]).toBeCloseTo(0.5); // 1 - 10/20
  });

  it('adds cursor links when the cursor is active', () => {
    const field = fieldFrom([
      [0, 0, 0],
      [10, 0, 0],
      [100, 0, 0],
    ]);
    const buffers = createLineBuffers(16);
    const cursor: Cursor = { x: 5, y: 0, z: 0, active: true };

    // A–B node link (2) + A–cursor (2) + B–cursor (2) = 6 vertices
    expect(computeLinks(field, buffers, 20, cursor, 30)).toBe(6);
  });

  it('never overflows the preallocated buffer', () => {
    const field = fieldFrom([
      [0, 0, 0],
      [10, 0, 0],
    ]);
    const buffers = createLineBuffers(1); // capacity = 2 vertices
    const cursor: Cursor = { x: 5, y: 0, z: 0, active: true };

    const vertices = computeLinks(field, buffers, 20, cursor, 30);

    expect(vertices).toBe(2);
    expect(vertices).toBeLessThanOrEqual(buffers.maxVertices);
  });
});

describe('geometry + material factories', () => {
  it('createLineBuffers preallocates the right sizes', () => {
    const buffers = createLineBuffers(10);
    expect(buffers.maxVertices).toBe(20);
    expect(buffers.positions).toHaveLength(60);
    expect(buffers.alphas).toHaveLength(20);
    expect(buffers.geometry.getAttribute('position')).toBeTruthy();
  });

  it('createPointsGeometry exposes the live position attribute', () => {
    const field = generateNodes(12, { x: 10, y: 10, z: 10 });
    const { geometry, positionAttr } = createPointsGeometry(field);
    expect(positionAttr.count).toBe(12);
    expect(geometry.getAttribute('aSeed')).toBeTruthy();
  });

  it('createPointsMaterial wires the color uniforms', () => {
    const { material, uniforms } = createPointsMaterial(
      new Color(0x112233),
      new Color(0x445566),
      vertexShader,
      fragmentShader
    );
    expect(uniforms.uColorA.value.getHex()).toBe(0x112233);
    expect(uniforms.uColorB.value.getHex()).toBe(0x445566);
    expect(material.transparent).toBe(true);
  });

  it('createLineMaterial wires color + opacity uniforms', () => {
    const { uniforms } = createLineMaterial(
      new Color(0x778899),
      0.4,
      lineVertexShader,
      lineFragmentShader
    );
    expect(uniforms.uLineColor.value.getHex()).toBe(0x778899);
    expect(uniforms.uLineOpacity.value).toBeCloseTo(0.4);
  });
});
