import { defineConfig } from 'vite'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import UnoCSS from 'unocss/vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import packageJSON from '../package.json'

/** Prefer GitHub release / CI version, fall back to package.json. */
function resolveAppVersion(): string {
  const fromEnv =
    process.env.APP_VERSION ||
    process.env.VITE_APP_VERSION ||
    (process.env.GITHUB_REF_TYPE === 'tag' ? process.env.GITHUB_REF_NAME : undefined)
  if (fromEnv?.trim()) {
    return fromEnv.trim().replace(/^v/i, '')
  }
  return packageJSON.version
}

export default defineConfig({
  root: path.resolve(__dirname, '../src'),
  resolve: { alias: { '@': path.resolve(__dirname, '../src') } },
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({ imports: ['vue'], dts: '../auto-import.d.ts' }),
    Components({ resolvers: [NaiveUiResolver()] }),
    createHtmlPlugin({
      inject: { data: { version: resolveAppVersion() } },
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
