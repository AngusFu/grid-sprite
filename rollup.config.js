import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import eslint from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';

export default {
  entry: 'src/app.js',
  dest: 'lib/app.js',
  format: 'iife',
  sourceMap: true,
  plugins: [
    // 语法风格检查
    eslint(),
    // 载入
    resolve({
      main: true,
      jsnext: true,
      browser: true,
    }),
    commonjs(),
    // 声明
    replace({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // 编译
    babel({
      exclude: 'node_modules/**',
      runtimeHelpers: true
    }),
    // 压缩
    uglify({}, minify),
  ]
};
