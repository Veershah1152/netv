import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes/index';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  config.cors.origin,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.pages.dev') ||
                      origin.includes('localhost');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// NOTE: compression() is intentionally omitted — Cloudflare Workers
// compresses responses at the edge automatically. Double-compressing
// causes brotli/gzip decode failures in the browser.
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
