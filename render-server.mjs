import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Startup logs
console.log('--- PRE-FLIGHT CHECKS ---');
console.log('Timestamp:', new Date().toISOString());
console.log('Node Version:', process.version);
console.log('Working Directory:', process.cwd());

// Environment Validation
const requiredEnv = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.warn(`WARNING: Missing recommended environment variables: ${missingEnv.join(', ')}`);
  console.warn('The application might not function correctly if these are required for data fetching.');
}

async function startServer() {
  const app = new Hono();

  // Health Check Endpoint
  app.get('/health', (c) => {
    return c.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }, 200);
  });

  // Serve static assets from dist/client
  // We prioritize assets over the SSR handler
  app.use('/assets/*', serveStatic({ root: './dist/client' }));
  app.use('/favicon.ico', serveStatic({ path: './dist/client/favicon.ico' }));
  app.use('/manifest.webmanifest', serveStatic({ path: './dist/client/manifest.webmanifest' }));
  app.use('/registerSW.js', serveStatic({ path: './dist/client/registerSW.js' }));

  // Dynamic port for Render
  const port = Number(process.env.PORT) || 3000;

  try {
    console.log('Loading SSR handler from dist/server/server.js...');
    // Import the build-generated SSR handler
    const serverHandler = await import('./dist/server/server.js');
    
    if (!serverHandler.default || typeof serverHandler.default.fetch !== 'function') {
      throw new Error('SSR handler not found or invalid. Ensure build completed successfully.');
    }

    // SSR Handler
    app.all('*', async (c) => {
      try {
        const response = await serverHandler.default.fetch(c.req.raw);
        return response;
      } catch (error) {
        console.error('SSR Execution Error:', error);
        return c.text('Internal Server Error during SSR', 500);
      }
    });

    console.log(`Starting server on port ${port}...`);

    serve({
      fetch: app.fetch,
      port: port
    }, (info) => {
      console.log('--- SERVER READY ---');
      console.log(`URL: http://localhost:${info.port}`);
      console.log(`Health Check: http://localhost:${info.port}/health`);
    });

  } catch (err) {
    console.error('CRITICAL STARTUP ERROR:', err);
    process.exit(1);
  }
}

startServer();
