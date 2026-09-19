import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function sanitizeUriPlugin() {
  return {
    name: 'sanitize-uri-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        try {
          if (req.url) decodeURI(req.url)
          next()
        } catch (e: any) {
          if (e instanceof URIError) {
            console.warn(`[sanitize-uri] Skipping malformed URI: ${req.url}`)
            res.statusCode = 400
            res.end('Bad Request - Malformed URI')
            return
          }
          next(e)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [sanitizeUriPlugin(), react()],
  server: {
    port: 8085,
    host: '0.0.0.0',
    open: true,
  },
  resolve: {
    alias: {
      react: path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
  },
})
