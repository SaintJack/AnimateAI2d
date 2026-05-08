import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      gsap: path.resolve(__dirname, 'node_modules/.gsap-P8aBvMdW'),
      'pixi.js': path.resolve(__dirname, 'node_modules/.pixi.js-bHElfxyP'),
      '@pixi/colord': path.resolve(__dirname, 'node_modules/@pixi/.colord-zs8b7HvI'),
      earcut: path.resolve(__dirname, 'node_modules/.earcut-KLt2oXf6'),
      eventemitter3: path.resolve(__dirname, 'node_modules/.eventemitter3-fih6I3zl'),
      'gifuct-js': path.resolve(__dirname, 'node_modules/.gifuct-js-6MB9KelC'),
      ismobilejs: path.resolve(__dirname, 'node_modules/.ismobilejs-NVpJ35F1'),
      'parse-svg-path': path.resolve(__dirname, 'node_modules/.parse-svg-path-tPaeTCET'),
      'tiny-lru': path.resolve(__dirname, 'node_modules/.tiny-lru-GAQbwNc0'),
      '@xmldom/xmldom': path.resolve(__dirname, 'node_modules/@xmldom/.xmldom-moiVBu6e'),
      '@esotericsoftware/spine-pixi-v8': path.resolve(
        __dirname,
        'node_modules/@esotericsoftware/.spine-pixi-v8-Hjj84wBp',
      ),
      '@esotericsoftware/spine-core': path.resolve(
        __dirname,
        'node_modules/@esotericsoftware/.spine-core-Zl814M8G/dist/index.js',
      ),
      '@esotericsoftware/spine-canvas': path.resolve(
        __dirname,
        'node_modules/@esotericsoftware/.spine-canvas-pfxfQXby/dist/index.js',
      ),
    },
  },
})
