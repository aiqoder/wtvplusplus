import { spawn } from 'child_process'
import { createServer, build } from 'vite'
import electron from 'electron'

const query = new URLSearchParams(import.meta.url.split('?')[1])
const debug = query.has('debug')

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchMain(server) {
  /**
   * @type {import('child_process').ChildProcessWithoutNullStreams | null}
   */
  let electronProcess = null
  const address = server.httpServer.address()
  const env = Object.assign(process.env, {
    VITE_DEV_SERVER_HOST: address.address,
    VITE_MAIN_DEV_SERVER_PORT: address.port,
  })
  /**
   * @type {import('vite').Plugin}
   */
  const startElectron = {
    name: 'electron-main-watcher',
    writeBundle() {
      electronProcess && electronProcess.kill()
      electronProcess = spawn(electron, ['.'], { stdio: 'inherit', env })
    },
  }

  return build({
    configFile: 'electron/main/vite.config.ts',
    mode: 'development',
    plugins: [!debug && startElectron].filter(Boolean),
    build: {
      watch: {},
    },
  })
}

/**
 * @type {(server: import('vite').ViteDevServer) => Promise<import('rollup').RollupWatcher>}
 */
function watchPreload(server) {
  return build({
    configFile: 'electron/preload/vite.config.ts',
    mode: 'development',
    plugins: [{
      name: 'electron-preload-watcher',
      writeBundle() {
        server.ws.send({ type: 'full-reload' })
      },
    }],
    build: {
      watch: {},
    },
  })
}

// 启动主应用
const server = await createServer({ configFile: 'src/vite.config.ts' })

// await server.listen()
await server.listen()
await watchPreload(server)
await watchMain(server)
