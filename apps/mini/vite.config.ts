import { defineConfig, type Plugin } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

/** Serve `/m/:token` as the H5 app so SMS links open the report card. */
function reportDeeplink(): Plugin {
  const rewrite = (req: { url?: string }) => {
    if (!req.url) return
    const path = req.url.split('?')[0]
    if (/^\/m\/[A-Za-z0-9_-]+$/.test(path)) req.url = '/index.html'
  }
  return {
    name: 'ditto-report-deeplink',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req)
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [reportDeeplink(), uni()],
})
