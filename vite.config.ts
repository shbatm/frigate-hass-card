import { defineConfig } from 'vitest/config';

// ts-prune-ignore-next
export default defineConfig({
  test: {
    coverage: {
      // Favor istanbul for coverage over v8 due to better accuracy.
      provider: 'istanbul',

      // Thresholds will automatically be updated as coverage improves to avoid
      // back-sliding.
      thresholdAutoUpdate: true,
      statements: 72.72,
      branches: 61.97,
      functions: 74.01,
      lines: 72.62,
    },
  },
});
