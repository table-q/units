import path from 'node:path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
  outDir: 'dist',
  esbuildOptions(options) {
    options.alias = {
      unit: path.resolve(__dirname, 'src/lib/unit'),
      util: path.resolve(__dirname, 'src/lib/util'),
      value: path.resolve(__dirname, 'src/lib/value'),
    };
  },
});
