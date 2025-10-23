// Entry point that will be bundled by Vite.
// This file is imported via `?url` from the Astro component, so Vite will
// emit a single module file that includes the client and its dependencies.

/* eslint-disable func-names, import/extensions */
(async function () {
  try {
    const disabled = localStorage.getItem('disableThree') === '1';
    const connectionSave = navigator.connection && navigator.connection.saveData;
    if (disabled || connectionSave || window.innerWidth < 640) return;

    // Dynamic import of the new modular Three.js architecture
    await import('./three/index.ts');
  } catch (err) {
    console.error('Failed to load Three.js animation:', err);
  }
})();
