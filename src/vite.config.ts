import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
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
