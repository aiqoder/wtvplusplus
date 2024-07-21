import { build } from 'vite'

await build({ configFile: 'electron/main/vite.config.ts' })
await build({ configFile: 'electron/preload/vite.config.ts' })
await build({ configFile: 'packages/src/vite.config.ts' })
