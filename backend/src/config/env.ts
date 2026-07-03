import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredVars = ['TMDB_API_KEY'] as const;

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.warn(`[Config] Warning: ${varName} is not set in environment variables.`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-dev-secret',
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  players: {
    player1Url: process.env.VITE_PLAYER1_URL || 'https://vidsrc.to/embed',
    player2Url: process.env.VITE_PLAYER2_URL || 'https://embed.su/embed',
    player3Url: process.env.VITE_PLAYER3_URL || 'https://www.vidking.net/embed',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-supabase-service-role-key',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },
} as const;
