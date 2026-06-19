import { defineConfig } from 'vite';

// The game is published to GitHub Pages under /CountTheStarsGame/.
// Use a relative base so the build works both there and when served from root.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
