import { builtinModules } from 'module'
import { defineConfig } from 'vite'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
// import { viteStaticCopy } from 'vite-plugin-static-copy'
const mac = process.platform === 'darwin' // 判断系统是不是mac

export default defineConfig({
  root: __dirname,
  build: {
    outDir: '../../dist/main',
    emptyOutDir: true,
    minify: process.env./* from mode option */NODE_ENV === 'production',
    sourcemap: process.env.NODE_ENV === 'development',
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => '[name].cjs',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        // @ts-ignore
        // ...Object.keys(pkg.dependencies || {}),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  //@ts-ignore
  preload: {
    // Must be use absolute path, this is the limit of rollup
    input: path.join(__dirname, 'electron-preload/index.ts'),
  },
  plugins: [
    viteStaticCopy({
      targets: mac ?
        [
          { src: '../execMac/*', dest: '../../dist/execMac' }, //执行拷贝
        ] :
        [
          { src: '../exec/*', dest: '../../dist/exec' }, //执行拷贝
        ]
    })
  ]
})
