import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      unit: path.resolve(__dirname, 'src/lib/unit'),
      util: path.resolve(__dirname, 'src/lib/util'),
      value: path.resolve(__dirname, 'src/lib/value'),
    },
  },
  test: {
    globals: true,
    setupFiles: ['./jest.setup.ts'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
        'src/**/*.bench.ts',
        'src/**/*.d.ts',
        'src/lib/util/jest.ts',
      ],
    },
  },
});
