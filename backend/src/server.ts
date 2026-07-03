import app from './app';
import { config } from './config/env';

const server = app.listen(config.port, () => {
  console.log(`\n🚀 NetVeer API running on http://localhost:${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   TMDB API Key: ${config.tmdb.apiKey ? '✓ Set' : '✗ Not set — add to .env'}\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

export default server;
