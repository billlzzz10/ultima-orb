import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: { reporter: ['text', 'lcov'] },
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10000,
    exclude: ['**/node_modules/**', '**/RealConnectivityTest.test.ts'],
  },
  resolve: {
    alias: {
      'obsidian': resolve(__dirname, './test/mocks/obsidian.ts'),
    },
  },
})
