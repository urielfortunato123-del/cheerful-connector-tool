import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';

// Global Error Handling
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Startup logs
console.log('--- RENDER DEPLOYMENT STARTUP ---');
console.log('Timestamp:', new Date().toISOString());
console.log('Node Version:', process.version);
console.log('Port:', process.env.PORT || '3000 (default)');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Configurado' : 'AUSENTE');
console.log('OCR_SPACE_API_KEY:', process.env.OCR_SPACE_API_KEY ? 'Configurado' : 'AUSENTE');

async function startServer() {
  const app = new Hono();

  // 1. Health Check (Must be first for fast response)
  app.get('/health', (c) => {
    return c.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }, 200);
  });

  // 2. Serve static assets
  // First, try to serve specific static assets
  app.use('/assets/*', serveStatic({ root: './dist/client' }));
  app.use('/favicon.ico', serveStatic({ path: './dist/client/favicon.ico' }));
  app.use('/manifest.webmanifest', serveStatic({ path: './dist/client/manifest.webmanifest' }));
  app.use('/registerSW.js', serveStatic({ path: './dist/client/registerSW.js' }));
  app.use('/logo.png', serveStatic({ path: './dist/client/logo.png' }));
  app.use('/pwa-*.png', serveStatic({ root: './dist/client' }));
  app.use('/apple-touch-icon.png', serveStatic({ path: './dist/client/apple-touch-icon.png' }));
  app.use('/splash-screen.png', serveStatic({ path: './dist/client/splash-screen.png' }));
  app.use('/apple-splash-*.png', serveStatic({ root: './dist/client' }));

  // 3. SSR Handler
  const port = Number(process.env.PORT) || 3000;
  const host = '0.0.0.0'; // Important for Render

  try {
    console.log('Loading SSR handler from ./dist/server/server.js...');
    const serverHandler = await import('./dist/server/server.js');
    
    if (!serverHandler.default || typeof serverHandler.default.fetch !== 'function') {
      console.error('Invalid server handler exported from dist/server/server.js');
      console.log('Exported keys:', Object.keys(serverHandler));
      throw new Error('SSR handler invalid');
    }

    app.all('*', async (c) => {
      try {
        // Pass the request to TanStack Start handler
        return await serverHandler.default.fetch(c.req.raw);
      } catch (error) {
        console.error('SSR Runtime Error:', error);
        return c.text('Internal Server Error', 500);
      }
    });

    console.log(`Attempting to listen on ${host}:${port}...`);

    const server = serve({
      fetch: app.fetch,
      port: port,
      hostname: host
    }, (info) => {
      console.log('--- SERVER ACTIVE ---');
      console.log(`Listening on: http://${info.address}:${info.port}`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log('Shutdown signal received. Closing server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('CRITICAL STARTUP ERROR:', err);
    // On Render, we want to stay alive briefly to show the error in logs
    // before the healthcheck fails and Render kills the process.
    setTimeout(() => process.exit(1), 5000);
  }
}

startServer().catch(err => {
  console.error('FAILED TO START SERVER:', err);
  process.exit(1);
});
