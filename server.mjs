import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Render doesn't use standard .output/server paths by default with NitroPreset node-server 
// but instead places things in .output relative to root or .output/public
const app = new Hono()

// Serve static files from .output/public (standard for TanStack Start / Nitro)
app.use('*', serveStatic({ root: './.output/public' }))

// Fallback to TanStack Start handler in .output/server/index.mjs
const serverPath = path.join(__dirname, '.output', 'server', 'index.mjs')

app.all('*', async (c) => {
  if (fs.existsSync(serverPath)) {
    const { default: handler } = await import(serverPath)
    return handler(c.req.raw, {}, {})
  }
  return c.text('Server output not found. Run build first.', 500)
})

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port)
})
