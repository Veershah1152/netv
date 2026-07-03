/**
 * Cloudflare Workers entry point for NetVeer API
 * Uses httpServerHandler to bridge Express.js with Workers runtime.
 * 
 * IMPORTANT: app.listen() must be called at module scope so that
 * cloudflare:node's httpServerHandler can intercept it and wire up
 * the Worker fetch handler to the Express app.
 */
import { httpServerHandler } from 'cloudflare:node';
import app from './app';

// Start the Express server — the cloudflare:node runtime intercepts
// this listen() call instead of opening a real TCP socket.
app.listen(5000);

export default httpServerHandler({ port: 5000 });
