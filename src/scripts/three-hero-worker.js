// Worker module that generates particle positions and posts them back as a transferable ArrayBuffer
// This file is bundled by Vite when used via `new Worker(new URL(...), { type: 'module' })`

// Generate random cloud positions (original behavior)
function generateCloudPositions(particleCount) {
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  return positions;
}

// Generate sphere positions
function generateSpherePositions(particleCount, radius = 60) {
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    // Fibonacci sphere distribution for even spacing
    const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

    positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

// Generate torus positions
function generateTorusPositions(particleCount, majorRadius = 40, minorRadius = 15) {
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const u = (i / particleCount) * Math.PI * 2;
    const v = (((i * 17) % particleCount) / particleCount) * Math.PI * 2; // Prime number for better distribution

    const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
    const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
    const z = minorRadius * Math.sin(v);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

self.addEventListener('message', (ev) => {
  const { particleCount = 220 } = ev.data || {};

  // Generate all geometries
  const cloudPositions = generateCloudPositions(particleCount);
  const spherePositions = generateSpherePositions(particleCount);
  const torusPositions = generateTorusPositions(particleCount);

  // Send all three geometries back
  // Note: We can't transfer multiple buffers at once, so we send them as clones
  self.postMessage(
    {
      positions: cloudPositions.buffer,
      spherePositions: spherePositions.buffer,
      torusPositions: torusPositions.buffer,
    },
    [cloudPositions.buffer, spherePositions.buffer, torusPositions.buffer]
  );
});
