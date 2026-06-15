import * as THREE from 'three';

/**
 * Three.js Constellation Background Constants
 *
 * A site-wide network of drifting "nodes" connected by distance-faded lines.
 * World-space extents (how wide/tall the field is) are derived from the camera
 * at runtime — see `getVisibleHalfExtents` in core.ts — so the field always
 * fills the viewport regardless of aspect ratio.
 */

// Node (particle) System — actual count is chosen per-device at runtime
// (see `pickNodeCount` in utils.ts); this is the upper bound used for buffer
// preallocation and the O(n²) link scan.
export const MAX_NODE_COUNT = 170;

// Preallocation factor for the line vertex buffer. Worst case a node links to
// several neighbours plus the cursor; 8 links/node is comfortably above the
// realistic average of ~3–4 and caps memory at a few KB.
export const MAX_LINKS_PER_NODE = 8;

// Depth of the field on the z-axis (half-extent). Gives the network parallax
// depth without pushing nodes behind the camera.
export const NODE_DEPTH = 26;

// Push nodes slightly past the visible edges so the network feels continuous
// rather than framed by empty margins.
export const NODE_MARGIN = 1.12;

// Linking
export const LINK_DISTANCE = 24; // nodes closer than this (world units) get a line
export const CURSOR_LINK_DISTANCE = 30; // nodes within this of the cursor link to it

// Motion
export const NODE_DRIFT_SPEED = 2.2; // world units / second
export const POINTER_ATTRACT = 0.9; // gentle pull of nearby nodes toward the cursor (0–1 per sec)
// Minimum pointer travel (NDC units) per frame for attraction to apply. A resting
// cursor skips attraction so nearby nodes never collapse into a bright knot.
export const POINTER_MOVE_EPSILON = 0.0015;
export const PARALLAX_AMOUNT = 5; // group offset from pointer, for depth feel
export const PARALLAX_LERP = 0.05; // easing of the parallax offset
export const SCROLL_ROTATION = 0.45; // radians of slow z-tilt across a full-page scroll
export const MAX_DELTA = 0.05; // clamp frame delta (s) so tab-switch jumps don't teleport nodes

// Point Appearance
export const POINT_SIZE = 2.6; // base size; scaled by depth + per-node seed in the shader

// Color Transitions
export const COLOR_LERP_SPEED = 0.04;

// Scroll-based Effects
export const SCROLL_COLOR_INTENSITY_MIN = 0.85;
export const SCROLL_COLOR_INTENSITY_RANGE = 0.3;

// Camera Settings
export const CAMERA_FOV = 60;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 1000;
export const CAMERA_POSITION_Z = 70;

// Renderer Settings — fixed full-viewport canvas, so keep DPR modest
export const MAX_PIXEL_RATIO = 1.75;

// Theme-aware Color Schemes — "Instrument" palette: signal amber + terminal
// teal. Light values are deeper so the network stays visible over the warm
// bone background; dark values glow.
export const COLOR_SCHEMES = {
  light: {
    a: new THREE.Color(0xb5740d), // deep amber
    b: new THREE.Color(0x0d8478), // deep teal
  },
  dark: {
    a: new THREE.Color(0xf3b24b), // signal amber
    b: new THREE.Color(0x5eead4), // terminal teal
  },
} as const;

// Line opacity is theme-tuned — light mode needs a stronger line to read.
export const LINK_OPACITY = {
  light: 0.5,
  dark: 0.34,
} as const;

// Resize Defaults
export const MIN_HEIGHT = 300;
