import axios from 'axios';
import { config } from './env';

const tmdbClient = axios.create({
  baseURL: config.tmdb.baseUrl,
  timeout: 10000,
  params: {
    api_key: config.tmdb.apiKey,
  },
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

tmdbClient.interceptors.request.use(
  (cfg) => {
    return cfg;
  },
  (error) => Promise.reject(error)
);

tmdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.status_message || 'TMDB API error';
      const err = new Error(message) as Error & { statusCode: number };
      err.statusCode = status;
      return Promise.reject(err);
    }
    return Promise.reject(error);
  }
);

export default tmdbClient;
