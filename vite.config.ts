import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// One id per build. The app compares it with /version.json so a screen left open
// reloads itself after a new deploy instead of showing an old version forever.
const BUILD_ID = Date.now().toString()

function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD_ID }) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionFile()],
  define: { __BUILD_ID__: JSON.stringify(BUILD_ID) },
})
