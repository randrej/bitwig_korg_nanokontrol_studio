import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: 'build/Korg_nanoKONTROL_Studio.control.js',
    format: 'es',
    sourcemap: true,
    name: 'Korg_nanoKONTROL_Studio',
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
  external: [],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
    unknownGlobalSideEffects: false,
  },
};
