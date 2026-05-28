import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import serverHandler from './dist/server/server.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Hono()

// Serve static files from dist/client
app.use('*', serveStatic({ root: './dist/client' }))

// Fallback to TanStack Start handler
app.all('*', async (c) => {
  return serverHandler.fetch(c.req.raw, {}, {})
})

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port)
})
