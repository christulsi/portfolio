/**
 * Shader Programs for Particle System
 */

/**
 * Vertex Shader
 * Handles particle position morphing and animation
 */
export const vertexShader = `
  precision highp float;
  uniform float uTime;
  uniform float uPointSize;
  uniform float uMorphFactor;
  attribute float aSeed;
  attribute vec3 aSpherePosition;
  attribute vec3 aTorusPosition;
  varying float vSeed;
  varying vec3 vPosition;

  // Simple pseudo-noise function
  float snoise(float x) {
    return sin(x) * 0.5 + 0.5;
  }

  // Smoothstep easing function for smooth morphing
  float smootherstep(float edge0, float edge1, float x) {
    float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  void main() {
    vSeed = aSeed;

    // Morph between sphere and torus based on uMorphFactor (0 = sphere, 1 = torus)
    float morphT = smootherstep(0.3, 0.7, uMorphFactor);
    vec3 morphedPosition = mix(aSpherePosition, aTorusPosition, morphT);

    vPosition = morphedPosition;
    float t = uTime * (0.3 + aSeed * 0.7);

    // Reduced flow displacement for morphed geometry
    float phase = snoise(
      morphedPosition.x * 0.02 +
      morphedPosition.y * 0.03 +
      t * 0.8 +
      aSeed * 10.0
    );

    // Less flow when fully morphed
    float flowIntensity = 1.0 - morphT * 0.7;

    vec3 flowOffset = normalize(vec3(
      sin(t + aSeed * 6.2831),
      cos(t * 0.7 + aSeed * 3.1415),
      sin(morphedPosition.x * 0.01 + aSeed)
    )) * (8.0 * phase * flowIntensity);

    vec3 displaced = morphedPosition + flowOffset;

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    gl_PointSize = uPointSize * (1.0 + aSeed * 1.2) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * Fragment Shader
 * Handles particle appearance and coloring
 */
export const fragmentShader = `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uColorIntensity;
  varying float vSeed;
  varying vec3 vPosition;

  void main() {
    // Create soft circular point
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.0, d);

    // Fresnel rim lighting effect for more visual depth
    float fresnel = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
    float finalAlpha = alpha * (0.9 + fresnel * 0.3);

    // Mix colors based on vertical position and randomness
    float mixv = clamp((vPosition.y + 40.0) / 80.0 + vSeed * 0.2, 0.0, 1.0);
    vec3 color = mix(uColorA, uColorB, mixv) * uColorIntensity;

    gl_FragColor = vec4(color, finalAlpha);
  }
`;
