import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import resolve from 'vite-plugin-resolve'
import electron from 'vite-plugin-electron-renderer'
import AutoImport from "unplugin-auto-import/vite"
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import pkg from '../package.json'
// https://vitejs.dev/config/
export default defineConfig({
  mode: process.env.NODE_ENV,
  root: __dirname,
  resolve: {
    alias: {
      '@': __dirname,
    }
  },
  // optimizeDeps: {
  //   exclude: [
  //     "@syntect/wasm"
  //   ]
  // },
  plugins: [
    vue(),
    electron(),
    resolve(
      /**
       * Here you can specify other modules
       * 🚧 You have to make sure that your module is in `dependencies` and not in the` devDependencies`,
       *    which will ensure that the electron-builder can package it correctly
       */
      {
        // If you use electron-store, this will work - ESM format code snippets
        // 'electron-store': 'const Store = require("electron-store"); export default Store;',
      }
    ),
    UnoCSS(),
    AutoImport({
      imports: ["vue"],
      dts: "./auto-import.d.ts"
    }),
    // polyfillExports(),
    Components({
      resolvers: [NaiveUiResolver()]
    }),
    createHtmlPlugin({
      inject: {
        data: {
          version: pkg.version,
        },
      },
    })
  ],
  base: './',
  build: {
    outDir: '../dist/renderer',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    cssCodeSplit: false,
    assetsInlineLimit: 1024 * 1024,
  },
  server: {
    host: "127.0.0.1",
    port: 3344,
  },
})
