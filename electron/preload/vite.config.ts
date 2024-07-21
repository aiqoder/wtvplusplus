import { join } from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from '../../package.json'
const mac = process.platform === 'darwin' // 判断系统是不是mac

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/preload',
    emptyOutDir: true,
    minify: process.env./* from mode option */NODE_ENV === 'production',
    // https://github.com/caoxiemeihao/electron-vue-vite/issues/61
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
    rollupOptions: {
      input: {
        // multiple entry
        index: join(__dirname, 'index.ts'),
      },
      output: {
        format: 'cjs',
        entryFileNames: '[name].cjs',
        manualChunks: {},
      },
      external: [
        'electron',
        ...builtinModules,
        // @ts-ignore
        ...Object.keys(pkg.dependencies || {}),
        // 'ip2region',
      ],
      plugins: [
        nodePolyfills() as unknown as null,
      ]
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: './views/*', dest: '../../dist/preload/views' },
      ]
    })
  ],
})
