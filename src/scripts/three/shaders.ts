/**
 * Shader programs for the constellation background.
 *
 * Two materials: glowing round points for the nodes, and thin additive-ish
 * lines (rendered with normal blending so they read on both light and dark
 * backgrounds) for the connections. Per-vertex alpha fades each line by
 * distance so the network looks soft rather than wireframe-hard.
 */

/**
 * Point (node) vertex shader.
 * `position` is the live node position, mutated on the CPU every frame.
 */
export const vertexShader = `
  precision highp float;
  uniform float uTime;
  uniform float uPointSize;
  attribute float aSeed;
  varying float vSeed;

  void main() {
    vSeed = aSeed;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Gentle per-node twinkle so the field feels alive even when nearly still.
    float twinkle = 0.7 + 0.3 * sin(uTime * (0.5 + aSeed * 1.5) + aSeed * 6.2831);

    // Size attenuates with depth; larger seeds read as nearer/brighter nodes.
    gl_PointSize = uPointSize * (0.6 + aSeed * 0.9) * twinkle * (220.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Point (node) fragment shader — soft glowing disc.
 */
export const fragmentShader = `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uColorIntensity;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Soft core with a brighter centre.
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 1.4);

    vec3 color = mix(uColorA, uColorB, vSeed) * uColorIntensity;
    gl_FragColor = vec4(color, glow);
  }
`;

/**
 * Line (connection) vertex shader. `aLineAlpha` carries the distance fade.
 */
export const lineVertexShader = `
  precision highp float;
  attribute float aLineAlpha;
  varying float vAlpha;

  void main() {
    vAlpha = aLineAlpha;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Line (connection) fragment shader.
 */
export const lineFragmentShader = `
  precision highp float;
  uniform vec3 uLineColor;
  uniform float uLineOpacity;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uLineColor, vAlpha * uLineOpacity);
  }
`;
