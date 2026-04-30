import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',')
  .map((host) => host.trim())
  .filter(Boolean)
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET?.trim() || 'http://localhost:8023'
const productionSiteUrl = (
  process.env.VITE_PRODUCTION_SITE_URL?.trim() || 'https://kvatum.ru'
).replace(/\/+$/, '')

function resolveAllowIndexing(mode: string): boolean {
  const explicitValue = process.env.VITE_ALLOW_INDEXING?.trim()

  if (explicitValue) {
    return explicitValue === 'true'
  }

  return mode === 'production'
}

function createRobotsTxt(allowIndexing: boolean): string {
  if (!allowIndexing) {
    return ['User-agent: *', 'Disallow: /', ''].join('\n')
  }

  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${productionSiteUrl}/sitemap.xml`, ''].join(
    '\n'
  )
}

function createSitemapXml(): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url>',
    `    <loc>${productionSiteUrl}/</loc>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
    '</urlset>',
    ''
  ].join('\n')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const robotsTxt = createRobotsTxt(resolveAllowIndexing(mode))
  const sitemapXml = createSitemapXml()

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'seo-files-by-mode',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/robots.txt') {
              res.setHeader('Content-Type', 'text/plain')
              res.end(robotsTxt)
              return
            }

            if (req.url === '/sitemap.xml') {
              res.setHeader('Content-Type', 'application/xml')
              res.end(sitemapXml)
              return
            }

            next()
          })
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'robots.txt',
            source: robotsTxt
          })
          this.emitFile({
            type: 'asset',
            fileName: 'sitemap.xml',
            source: sitemapXml
          })
        }
      }
    ],
    resolve: {
      dedupe: ['react', 'react-dom', 'react-router'],
      alias: {
        '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
        '@capabilities': fileURLToPath(new URL('./src/capabilities', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url))
      }
    },
    server: {
      allowedHosts: allowedHosts?.length ? allowedHosts : undefined,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api')
        },
        '/ws': {
          target: apiProxyTarget,
          changeOrigin: true,
          ws: true
        },
        '/v1/connect': {
          target: apiProxyTarget,
          changeOrigin: true,
          ws: true
        }
      }
    }
  }
})
