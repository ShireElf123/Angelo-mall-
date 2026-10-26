/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5180,
    // Arena / cloud previews use per-session wildcard hosts.
    allowedHosts: ['.e2b.app', '.run.app'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.e2b.app', '.run.app'],
  },
  test: {
    environment: 'jsdom',
    // Enables @testing-library/react auto-cleanup between component tests.
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
