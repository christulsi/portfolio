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

/**
 * NEW: Hero arrowhead vertex shader.
 *
 * Each particle carries two positions: `aFormed` (its place in the Golden
 * Arrowhead mark) and `aScattered` (its place when the mark has dissolved into
 * the background network). `uScatter` blends between them with a per-particle
 * delay so the mark peels away from the tip. While formed, a travelling wave
 * ripples it like a flag, and the pointer pushes nearby particles aside.
 */
export const arrowheadVertexShader = `
  precision highp float;
  uniform float uTime;
  uniform float uScatter;
  uniform float uWave;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerStrength;
  uniform float uPointerRadius;
  attribute vec3 aFormed;
  attribute vec3 aScattered;
  attribute float aKind;
  attribute float aSeed;
  attribute float aDelay;
  varying float vKind;
  varying float vSeed;
  varying float vFade;

  void main() {
    vKind = aKind;
    vSeed = aSeed;

    float t = clamp(uScatter * 1.6 - aDelay * 0.6, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    vFade = t;

    // All offsets below are in the mark's local space, where it is one unit
    // tall (the object is scaled up to its on-screen size).
    vec3 pos = aFormed;

    // Flag ripple: a wave travelling from the hoist to the tip, growing
    // toward the free end. Fades out as the mark scatters.
    float along = clamp(aFormed.x + 0.5, 0.0, 1.0);
    float wave = sin(aFormed.x * 9.0 - uTime * 1.8 + aFormed.y * 2.0);
    pos.z += wave * uWave * (0.25 + along) * (1.0 - t);
    pos.y += cos(aFormed.x * 7.0 - uTime * 1.4) * uWave * 0.2 * along * (1.0 - t);

    // Idle shimmer so the mark never sits perfectly still.
    pos += vec3(
      sin(uTime * 0.7 + aSeed * 6.2831),
      cos(uTime * 0.6 + aSeed * 4.1),
      sin(uTime * 0.8 + aSeed * 3.3)
    ) * 0.004;

    // Pointer repulsion: particles part around the cursor and lift toward
    // the camera.
    vec2 away = pos.xy - uPointer.xy;
    float dist = length(away);
    float push = uPointerStrength * smoothstep(uPointerRadius, 0.0, dist);
    pos.xy += (away / max(dist, 0.001)) * push * 0.12;
    pos.z += push * 0.2;

    pos = mix(pos, aScattered, t);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) * (110.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * NEW: Hero arrowhead fragment shader — soft discs, gold body, contrasting
 * border band (the flag's fimbriation), fading as the mark scatters.
 */
export const arrowheadFragmentShader = `
  precision highp float;
  uniform vec3 uColorBody;
  uniform vec3 uColorEdge;
  uniform float uOpacity;
  varying float vKind;
  varying float vSeed;
  varying float vFade;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float disc = smoothstep(0.5, 0.15, d);
    vec3 color = mix(uColorBody, uColorEdge, vKind) * (0.86 + vSeed * 0.28);
    float alpha = disc * uOpacity * (1.0 - vFade * 0.85);
    gl_FragColor = vec4(color, alpha);
  }
`;
