// src/vite.config.ts
import { defineConfig } from "file:///D:/mycode/wtv/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/mycode/wtv/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import resolve from "file:///D:/mycode/wtv/node_modules/vite-plugin-resolve/dist/index.mjs";
import electron from "file:///D:/mycode/wtv/node_modules/vite-plugin-electron-renderer/dist/index.mjs";
import AutoImport from "file:///D:/mycode/wtv/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///D:/mycode/wtv/node_modules/unplugin-vue-components/dist/vite.js";
import { NaiveUiResolver } from "file:///D:/mycode/wtv/node_modules/unplugin-vue-components/dist/resolvers.js";
import UnoCSS from "file:///D:/mycode/wtv/node_modules/unocss/dist/vite.mjs";
import { createHtmlPlugin } from "file:///D:/mycode/wtv/node_modules/vite-plugin-html/dist/index.mjs";

// package.json
var package_default = {
  name: "wtv-next",
  version: "1.1.9",
  main: "dist/main/index.cjs",
  description: "wtv \u5DE5\u5177\u7BB1",
  author: "\u4E00\u4E2A\u6A59\u5B50pro <942242856@qq.com>",
  license: "MIT",
  private: true,
  keywords: [
    "electron",
    "rollup",
    "vite",
    "vue3",
    "vue"
  ],
  debug: {
    env: {
      VITE_DEV_SERVER_URL: "http://127.0.0.1:3344/",
      VSCODE_DEBUG: true
    }
  },
  type: "module",
  scripts: {
    dev: "chcp 65001 && node scripts/watch.mjs",
    prebuild: "node scripts/build.mjs",
    build: "npm run prebuild && electron-builder",
    "build:mac": "npm run prebuild && electron-builder --mac"
  },
  devDependencies: {
    "@vitejs/plugin-vue": "^5.0.4",
    electron: "^22.0.0",
    "electron-builder": "^22.14.13",
    "electron-store": "^8.1.0",
    "rollup-plugin-node-polyfills": "^0.2.1",
    sass: "^1.77.8",
    typescript: "^5.4.2",
    unocss: "^0.61.5",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.3",
    vite: "^5.0.12",
    "vite-plugin-electron": "^0.15.6",
    "vite-plugin-electron-renderer": "^0.14.5",
    "vite-plugin-html": "^3.2.2",
    "vite-plugin-resolve": "^2.5.1",
    "vite-plugin-static-copy": "^1.0.6",
    vue: "^3.4.21",
    "vue-tsc": "^2.0.6"
  },
  dependencies: {
    "@codemirror/autocomplete": "^6.17.0",
    "@codemirror/lang-yaml": "^6.1.1",
    "@codemirror/state": "^6.4.1",
    "@codemirror/theme-one-dark": "^6.1.2",
    "@codemirror/view": "^6.28.6",
    "@ffmpeg/ffmpeg": "^0.12.10",
    "@ffmpeg/util": "^0.12.1",
    "@vavt/util": "^1.7.0",
    "@vicons/ionicons5": "^0.12.0",
    "@vueuse/core": "^10.11.0",
    axios: "^1.7.2",
    bufferutil: "^4.0.8",
    chardet: "^2.0.0",
    codemirror: "^6.0.1",
    "crypto-js": "^4.2.0",
    dayjs: "^1.11.12",
    express: "^4.19.2",
    howtools: "^0.2.4",
    "iconv-lite": "^0.6.3",
    "iptv-playlist-parser": "^0.13.0",
    "lodash-es": "^4.17.21",
    "m3u-parser-generator": "^2.0.0",
    mitt: "^3.0.1",
    "mpegts.js": "^1.7.3",
    "naive-ui": "^2.39.0",
    pinia: "^2.1.7",
    "utf-8-validate": "^5.0.10",
    "vue-loading-overlay": "^6.0.4",
    "vue-router": "^4.4.0",
    "vue3-contextmenu": "^0.2.12",
    ws: "8.11.0",
    yaml: "^2.5.0"
  }
};

// src/vite.config.ts
var __vite_injected_original_dirname = "D:\\mycode\\wtv\\src";
var vite_config_default = defineConfig({
  mode: process.env.NODE_ENV,
  root: __vite_injected_original_dirname,
  resolve: {
    alias: {
      "@": __vite_injected_original_dirname
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
          version: package_default.version
        }
      }
    })
  ],
  base: "./",
  build: {
    outDir: "../dist/renderer",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    cssCodeSplit: false,
    assetsInlineLimit: 1024 * 1024
  },
  server: {
    host: "127.0.0.1",
    port: 3344
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL3ZpdGUuY29uZmlnLnRzIiwgInBhY2thZ2UuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXG15Y29kZVxcXFx3dHZcXFxcc3JjXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxteWNvZGVcXFxcd3R2XFxcXHNyY1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovbXljb2RlL3d0di9zcmMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcclxuaW1wb3J0IHJlc29sdmUgZnJvbSAndml0ZS1wbHVnaW4tcmVzb2x2ZSdcclxuaW1wb3J0IGVsZWN0cm9uIGZyb20gJ3ZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyJ1xyXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiXHJcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXHJcbmltcG9ydCB7IE5haXZlVWlSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IFVub0NTUyBmcm9tICd1bm9jc3Mvdml0ZSdcclxuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWh0bWwnXHJcbmltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJ1xyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIG1vZGU6IHByb2Nlc3MuZW52Lk5PREVfRU5WLFxyXG4gIHJvb3Q6IF9fZGlybmFtZSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICAnQCc6IF9fZGlybmFtZSxcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIG9wdGltaXplRGVwczoge1xyXG4gIC8vICAgZXhjbHVkZTogW1xyXG4gIC8vICAgICBcIkBzeW50ZWN0L3dhc21cIlxyXG4gIC8vICAgXVxyXG4gIC8vIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgdnVlKCksXHJcbiAgICBlbGVjdHJvbigpLFxyXG4gICAgcmVzb2x2ZShcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEhlcmUgeW91IGNhbiBzcGVjaWZ5IG90aGVyIG1vZHVsZXNcclxuICAgICAgICogXHVEODNEXHVERUE3IFlvdSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHlvdXIgbW9kdWxlIGlzIGluIGBkZXBlbmRlbmNpZXNgIGFuZCBub3QgaW4gdGhlYCBkZXZEZXBlbmRlbmNpZXNgLFxyXG4gICAgICAgKiAgICB3aGljaCB3aWxsIGVuc3VyZSB0aGF0IHRoZSBlbGVjdHJvbi1idWlsZGVyIGNhbiBwYWNrYWdlIGl0IGNvcnJlY3RseVxyXG4gICAgICAgKi9cclxuICAgICAge1xyXG4gICAgICAgIC8vIElmIHlvdSB1c2UgZWxlY3Ryb24tc3RvcmUsIHRoaXMgd2lsbCB3b3JrIC0gRVNNIGZvcm1hdCBjb2RlIHNuaXBwZXRzXHJcbiAgICAgICAgLy8gJ2VsZWN0cm9uLXN0b3JlJzogJ2NvbnN0IFN0b3JlID0gcmVxdWlyZShcImVsZWN0cm9uLXN0b3JlXCIpOyBleHBvcnQgZGVmYXVsdCBTdG9yZTsnLFxyXG4gICAgICB9XHJcbiAgICApLFxyXG4gICAgVW5vQ1NTKCksXHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgaW1wb3J0czogW1widnVlXCJdLFxyXG4gICAgICBkdHM6IFwiLi9hdXRvLWltcG9ydC5kLnRzXCJcclxuICAgIH0pLFxyXG4gICAgLy8gcG9seWZpbGxFeHBvcnRzKCksXHJcbiAgICBDb21wb25lbnRzKHtcclxuICAgICAgcmVzb2x2ZXJzOiBbTmFpdmVVaVJlc29sdmVyKCldXHJcbiAgICB9KSxcclxuICAgIGNyZWF0ZUh0bWxQbHVnaW4oe1xyXG4gICAgICBpbmplY3Q6IHtcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICB2ZXJzaW9uOiBwa2cudmVyc2lvbixcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSlcclxuICBdLFxyXG4gIGJhc2U6ICcuLycsXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJy4uL2Rpc3QvcmVuZGVyZXInLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgICBzb3VyY2VtYXA6IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnLFxyXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiAxMDI0ICogMTAyNCxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCIxMjcuMC4wLjFcIixcclxuICAgIHBvcnQ6IDMzNDQsXHJcbiAgfSxcclxufSlcclxuIiwgIntcclxuICBcIm5hbWVcIjogXCJ3dHYtbmV4dFwiLFxyXG4gIFwidmVyc2lvblwiOiBcIjEuMS45XCIsXHJcbiAgXCJtYWluXCI6IFwiZGlzdC9tYWluL2luZGV4LmNqc1wiLFxyXG4gIFwiZGVzY3JpcHRpb25cIjogXCJ3dHYgXHU1REU1XHU1MTc3XHU3QkIxXCIsXHJcbiAgXCJhdXRob3JcIjogXCJcdTRFMDBcdTRFMkFcdTZBNTlcdTVCNTBwcm8gPDk0MjI0Mjg1NkBxcS5jb20+XCIsXHJcbiAgXCJsaWNlbnNlXCI6IFwiTUlUXCIsXHJcbiAgXCJwcml2YXRlXCI6IHRydWUsXHJcbiAgXCJrZXl3b3Jkc1wiOiBbXHJcbiAgICBcImVsZWN0cm9uXCIsXHJcbiAgICBcInJvbGx1cFwiLFxyXG4gICAgXCJ2aXRlXCIsXHJcbiAgICBcInZ1ZTNcIixcclxuICAgIFwidnVlXCJcclxuICBdLFxyXG4gIFwiZGVidWdcIjoge1xyXG4gICAgXCJlbnZcIjoge1xyXG4gICAgICBcIlZJVEVfREVWX1NFUlZFUl9VUkxcIjogXCJodHRwOi8vMTI3LjAuMC4xOjMzNDQvXCIsXHJcbiAgICAgIFwiVlNDT0RFX0RFQlVHXCI6IHRydWVcclxuICAgIH1cclxuICB9LFxyXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gIFwic2NyaXB0c1wiOiB7XHJcbiAgICBcImRldlwiOiBcImNoY3AgNjUwMDEgJiYgbm9kZSBzY3JpcHRzL3dhdGNoLm1qc1wiLFxyXG4gICAgXCJwcmVidWlsZFwiOiBcIm5vZGUgc2NyaXB0cy9idWlsZC5tanNcIixcclxuICAgIFwiYnVpbGRcIjogXCJucG0gcnVuIHByZWJ1aWxkICYmIGVsZWN0cm9uLWJ1aWxkZXJcIixcclxuICAgIFwiYnVpbGQ6bWFjXCI6IFwibnBtIHJ1biBwcmVidWlsZCAmJiBlbGVjdHJvbi1idWlsZGVyIC0tbWFjXCJcclxuICB9LFxyXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiXjUuMC40XCIsXHJcbiAgICBcImVsZWN0cm9uXCI6IFwiXjIyLjAuMFwiLFxyXG4gICAgXCJlbGVjdHJvbi1idWlsZGVyXCI6IFwiXjIyLjE0LjEzXCIsXHJcbiAgICBcImVsZWN0cm9uLXN0b3JlXCI6IFwiXjguMS4wXCIsXHJcbiAgICBcInJvbGx1cC1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjogXCJeMC4yLjFcIixcclxuICAgIFwic2Fzc1wiOiBcIl4xLjc3LjhcIixcclxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjQuMlwiLFxyXG4gICAgXCJ1bm9jc3NcIjogXCJeMC42MS41XCIsXHJcbiAgICBcInVucGx1Z2luLWF1dG8taW1wb3J0XCI6IFwiXjAuMTguMFwiLFxyXG4gICAgXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50c1wiOiBcIl4wLjI3LjNcIixcclxuICAgIFwidml0ZVwiOiBcIl41LjAuMTJcIixcclxuICAgIFwidml0ZS1wbHVnaW4tZWxlY3Ryb25cIjogXCJeMC4xNS42XCIsXHJcbiAgICBcInZpdGUtcGx1Z2luLWVsZWN0cm9uLXJlbmRlcmVyXCI6IFwiXjAuMTQuNVwiLFxyXG4gICAgXCJ2aXRlLXBsdWdpbi1odG1sXCI6IFwiXjMuMi4yXCIsXHJcbiAgICBcInZpdGUtcGx1Z2luLXJlc29sdmVcIjogXCJeMi41LjFcIixcclxuICAgIFwidml0ZS1wbHVnaW4tc3RhdGljLWNvcHlcIjogXCJeMS4wLjZcIixcclxuICAgIFwidnVlXCI6IFwiXjMuNC4yMVwiLFxyXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjIuMC42XCJcclxuICB9LFxyXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcclxuICAgIFwiQGNvZGVtaXJyb3IvYXV0b2NvbXBsZXRlXCI6IFwiXjYuMTcuMFwiLFxyXG4gICAgXCJAY29kZW1pcnJvci9sYW5nLXlhbWxcIjogXCJeNi4xLjFcIixcclxuICAgIFwiQGNvZGVtaXJyb3Ivc3RhdGVcIjogXCJeNi40LjFcIixcclxuICAgIFwiQGNvZGVtaXJyb3IvdGhlbWUtb25lLWRhcmtcIjogXCJeNi4xLjJcIixcclxuICAgIFwiQGNvZGVtaXJyb3Ivdmlld1wiOiBcIl42LjI4LjZcIixcclxuICAgIFwiQGZmbXBlZy9mZm1wZWdcIjogXCJeMC4xMi4xMFwiLFxyXG4gICAgXCJAZmZtcGVnL3V0aWxcIjogXCJeMC4xMi4xXCIsXHJcbiAgICBcIkB2YXZ0L3V0aWxcIjogXCJeMS43LjBcIixcclxuICAgIFwiQHZpY29ucy9pb25pY29uczVcIjogXCJeMC4xMi4wXCIsXHJcbiAgICBcIkB2dWV1c2UvY29yZVwiOiBcIl4xMC4xMS4wXCIsXHJcbiAgICBcImF4aW9zXCI6IFwiXjEuNy4yXCIsXHJcbiAgICBcImJ1ZmZlcnV0aWxcIjogXCJeNC4wLjhcIixcclxuICAgIFwiY2hhcmRldFwiOiBcIl4yLjAuMFwiLFxyXG4gICAgXCJjb2RlbWlycm9yXCI6IFwiXjYuMC4xXCIsXHJcbiAgICBcImNyeXB0by1qc1wiOiBcIl40LjIuMFwiLFxyXG4gICAgXCJkYXlqc1wiOiBcIl4xLjExLjEyXCIsXHJcbiAgICBcImV4cHJlc3NcIjogXCJeNC4xOS4yXCIsXHJcbiAgICBcImhvd3Rvb2xzXCI6IFwiXjAuMi40XCIsXHJcbiAgICBcImljb252LWxpdGVcIjogXCJeMC42LjNcIixcclxuICAgIFwiaXB0di1wbGF5bGlzdC1wYXJzZXJcIjogXCJeMC4xMy4wXCIsXHJcbiAgICBcImxvZGFzaC1lc1wiOiBcIl40LjE3LjIxXCIsXHJcbiAgICBcIm0zdS1wYXJzZXItZ2VuZXJhdG9yXCI6IFwiXjIuMC4wXCIsXHJcbiAgICBcIm1pdHRcIjogXCJeMy4wLjFcIixcclxuICAgIFwibXBlZ3RzLmpzXCI6IFwiXjEuNy4zXCIsXHJcbiAgICBcIm5haXZlLXVpXCI6IFwiXjIuMzkuMFwiLFxyXG4gICAgXCJwaW5pYVwiOiBcIl4yLjEuN1wiLFxyXG4gICAgXCJ1dGYtOC12YWxpZGF0ZVwiOiBcIl41LjAuMTBcIixcclxuICAgIFwidnVlLWxvYWRpbmctb3ZlcmxheVwiOiBcIl42LjAuNFwiLFxyXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuNC4wXCIsXHJcbiAgICBcInZ1ZTMtY29udGV4dG1lbnVcIjogXCJeMC4yLjEyXCIsXHJcbiAgICBcIndzXCI6IFwiOC4xMS4wXCIsXHJcbiAgICBcInlhbWxcIjogXCJeMi41LjBcIlxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZPLFNBQVMsb0JBQW9CO0FBQzFRLE9BQU8sU0FBUztBQUNoQixPQUFPLGFBQWE7QUFDcEIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsdUJBQXVCO0FBQ2hDLE9BQU8sWUFBWTtBQUNuQixTQUFTLHdCQUF3Qjs7O0FDUmpDO0FBQUEsRUFDRSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxNQUFRO0FBQUEsRUFDUixhQUFlO0FBQUEsRUFDZixRQUFVO0FBQUEsRUFDVixTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsRUFDWCxVQUFZO0FBQUEsSUFDVjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFTO0FBQUEsSUFDUCxLQUFPO0FBQUEsTUFDTCxxQkFBdUI7QUFBQSxNQUN2QixjQUFnQjtBQUFBLElBQ2xCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBUTtBQUFBLEVBQ1IsU0FBVztBQUFBLElBQ1QsS0FBTztBQUFBLElBQ1AsVUFBWTtBQUFBLElBQ1osT0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLFVBQVk7QUFBQSxJQUNaLG9CQUFvQjtBQUFBLElBQ3BCLGtCQUFrQjtBQUFBLElBQ2xCLGdDQUFnQztBQUFBLElBQ2hDLE1BQVE7QUFBQSxJQUNSLFlBQWM7QUFBQSxJQUNkLFFBQVU7QUFBQSxJQUNWLHdCQUF3QjtBQUFBLElBQ3hCLDJCQUEyQjtBQUFBLElBQzNCLE1BQVE7QUFBQSxJQUNSLHdCQUF3QjtBQUFBLElBQ3hCLGlDQUFpQztBQUFBLElBQ2pDLG9CQUFvQjtBQUFBLElBQ3BCLHVCQUF1QjtBQUFBLElBQ3ZCLDJCQUEyQjtBQUFBLElBQzNCLEtBQU87QUFBQSxJQUNQLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2QsNEJBQTRCO0FBQUEsSUFDNUIseUJBQXlCO0FBQUEsSUFDekIscUJBQXFCO0FBQUEsSUFDckIsOEJBQThCO0FBQUEsSUFDOUIsb0JBQW9CO0FBQUEsSUFDcEIsa0JBQWtCO0FBQUEsSUFDbEIsZ0JBQWdCO0FBQUEsSUFDaEIsY0FBYztBQUFBLElBQ2QscUJBQXFCO0FBQUEsSUFDckIsZ0JBQWdCO0FBQUEsSUFDaEIsT0FBUztBQUFBLElBQ1QsWUFBYztBQUFBLElBQ2QsU0FBVztBQUFBLElBQ1gsWUFBYztBQUFBLElBQ2QsYUFBYTtBQUFBLElBQ2IsT0FBUztBQUFBLElBQ1QsU0FBVztBQUFBLElBQ1gsVUFBWTtBQUFBLElBQ1osY0FBYztBQUFBLElBQ2Qsd0JBQXdCO0FBQUEsSUFDeEIsYUFBYTtBQUFBLElBQ2Isd0JBQXdCO0FBQUEsSUFDeEIsTUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLElBQ1osT0FBUztBQUFBLElBQ1Qsa0JBQWtCO0FBQUEsSUFDbEIsdUJBQXVCO0FBQUEsSUFDdkIsY0FBYztBQUFBLElBQ2Qsb0JBQW9CO0FBQUEsSUFDcEIsSUFBTTtBQUFBLElBQ04sTUFBUTtBQUFBLEVBQ1Y7QUFDRjs7O0FEbEZBLElBQU0sbUNBQW1DO0FBV3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU0sUUFBUSxJQUFJO0FBQUEsRUFDbEIsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSztBQUFBLElBQ1A7QUFBQSxFQUNGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTUEsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1Q7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFNRTtBQUFBO0FBQUE7QUFBQSxNQUdBO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLElBQ1AsV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUNmLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLElBRUQsV0FBVztBQUFBLE1BQ1QsV0FBVyxDQUFDLGdCQUFnQixDQUFDO0FBQUEsSUFDL0IsQ0FBQztBQUFBLElBQ0QsaUJBQWlCO0FBQUEsTUFDZixRQUFRO0FBQUEsUUFDTixNQUFNO0FBQUEsVUFDSixTQUFTLGdCQUFJO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXLFFBQVEsSUFBSSxhQUFhO0FBQUEsSUFDcEMsY0FBYztBQUFBLElBQ2QsbUJBQW1CLE9BQU87QUFBQSxFQUM1QjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
