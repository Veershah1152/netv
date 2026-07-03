/**
 * Cloudflare Workers entry point for NetVeer API
 * Uses httpServerHandler to bridge Express.js with Workers runtime
 */
import { httpServerHandler } from 'cloudflare:node';
import './app'; // Initialize Express app (with all routes registered)

// Re-export the handler that Cloudflare Workers will call
export default httpServerHandler({ port: 5000 });
