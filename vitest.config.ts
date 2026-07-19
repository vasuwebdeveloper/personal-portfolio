import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Dev-only test runner for the pure TypeScript modules (lib/nacha). There is
 * deliberately no component/DOM testing here; `npm run build` remains the
 * verification gate for the site itself.
 */
const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: { alias: { "@": root } },
  test: {
    include: ["lib/**/__tests__/**/*.test.ts"],
  },
});
