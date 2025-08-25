import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/setup.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    reporters: ["verbose", "html"],
    outputFile: {
      html: "./test-results/index.html",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@test": resolve(__dirname, "./test"),
      "@core": resolve(__dirname, "./src/core"),
      "@ui": resolve(__dirname, "./src/ui"),
      "@tools": resolve(__dirname, "./src/tools"),
      "@ai": resolve(__dirname, "./src/ai"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"test"',
  },
});
