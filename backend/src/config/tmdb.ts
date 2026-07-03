import axios, { AxiosInstance } from 'axios';
import { config } from './env';

/**
 * Lazy singleton for the TMDB Axios client.
 * axios.create() is deferred to first use so it is never called
 * in global scope (Cloudflare Workers restriction).
 */
let _tmdbClient: AxiosInstance | null = null;

function getTmdbClient(): AxiosInstance {
  if (!_tmdbClient) {
    _tmdbClient = axios.create({
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

    _tmdbClient.interceptors.request.use(
      (cfg) => cfg,
      (error) => Promise.reject(error)
    );

    _tmdbClient.interceptors.response.use(
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
  }
  return _tmdbClient;
}

// Proxy so all existing callers (e.g. tmdbClient.get(...)) continue to work
const tmdbClient = new Proxy({} as AxiosInstance, {
  get(_target, prop) {
    return (getTmdbClient() as any)[prop];
  },
});

export default tmdbClient;
