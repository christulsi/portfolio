import * as THREE from 'three';

/**
 * Three.js Animation Constants
 */

// Particle System
export const PARTICLE_COUNT = 220;
export const POINT_SIZE = 1.6;

// Sphere Geometry
export const SPHERE_RADIUS = 60;

// Torus Geometry
export const TORUS_MAJOR_RADIUS = 40;
export const TORUS_MINOR_RADIUS = 15;

// Animation Speeds
export const ANIMATION_SPEED = 0.005;
export const AUTO_ROTATION_Y_SPEED = 0.6;
export const AUTO_ROTATION_X_AMPLITUDE = 0.12;
export const ROTATION_LERP_SPEED = 0.08;
export const COLOR_LERP_SPEED = 0.02;

// Pointer Interaction
export const POINTER_ROTATION_Y_MULTIPLIER = 0.6;
export const POINTER_ROTATION_X_MULTIPLIER = 0.3;

// Scroll-based Effects
export const SCROLL_COLOR_INTENSITY_MIN = 0.8;
export const SCROLL_COLOR_INTENSITY_RANGE = 0.2;

// Performance Monitoring
export const FPS_CHECK_INTERVAL = 60; // frames
export const LOW_FPS_THRESHOLD = 45;
export const LOW_FPS_COUNT_THRESHOLD = 3;

// Bloom Effect Settings
export const BLOOM_STRENGTH = 0.4;
export const BLOOM_RADIUS = 0.3;
export const BLOOM_THRESHOLD = 0.8;

// Camera Settings
export const CAMERA_FOV = 45;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_POSITION_Z = 80;

// Renderer Settings
export const MAX_PIXEL_RATIO = 2;

// Shader Morphing
export const MORPH_SMOOTHSTEP_START = 0.3;
export const MORPH_SMOOTHSTEP_END = 0.7;

// Theme-aware Color Schemes
export const COLOR_SCHEMES = {
  light: {
    a: new THREE.Color(0x3b82f6), // blue
    b: new THREE.Color(0x8b5cf6), // purple
  },
  dark: {
    a: new THREE.Color(0x06b6d4), // cyan
    b: new THREE.Color(0x7c3aed), // violet
  },
} as const;

// Visibility Observer Settings
export const VISIBILITY_THRESHOLD = 0.1;

// Resize Defaults
export const MIN_HEIGHT = 300;
