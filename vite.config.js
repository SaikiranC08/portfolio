import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.resolve(__dirname, '.appreciation_db.json')

function getCountFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
      return typeof data.count === 'number' ? data.count : 0
    }
  } catch (e) {
    // fallback
  }
  return 0
}

function saveCountToDisk(count) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ count, lastUpdated: new Date().toISOString() }, null, 2))
  } catch (e) {
    // fallback
  }
}

function appreciationDevApiPlugin() {
  return {
    name: 'appreciation-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/portfolio/appreciate') {
          if (req.method === 'GET') {
            const count = getCountFromDisk()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ count }))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              let action = 'like'
              try {
                if (body) {
                  const data = JSON.parse(body)
                  if (data.action === 'unlike' || data.action === 'decrement') {
                    action = 'unlike'
                  }
                }
              } catch (e) {}

              let current = getCountFromDisk()
              if (action === 'unlike') {
                current = Math.max(0, current - 1)
              } else {
                current += 1
              }
              saveCountToDisk(current)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ count: current }))
            })
            return
          }
        }
        next()
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), appreciationDevApiPlugin()],
  server: {
    port: 3000,
    open: true
  }
})

