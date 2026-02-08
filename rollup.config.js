import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js', // Adjust this if your entry point is different
  output: {
    file: 'dist/bundle.js',
    format: 'cjs', // Change to 'esm' or 'iife' if needed
    sourcemap: true,
  },
  plugins: [
    resolve(), // Resolves node_modules
    commonjs(), // Converts CommonJS modules to ES6
    terser(), // Minifies the bundle
  ],
};
