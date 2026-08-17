import { defineConfig } from 'vite'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import packageJSON from '../package.json'

export default defineConfig({
  root: path.resolve(__dirname, '../src'),
  resolve: { alias: { '@': path.resolve(__dirname, '../src') } },
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({ imports: ['vue'], dts: '../auto-import.d.ts' }),
    Components({ resolvers: [NaiveUiResolver()] }),
    createHtmlPlugin({
      inject: { data: { version: packageJSON.version } },
    }),
  ],
  base: './',
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  build: { outDir: path.resolve(__dirname, 'dist'), emptyOutDir: true, cssCodeSplit: false, assetsInlineLimit: 1024 * 1024 },
})
