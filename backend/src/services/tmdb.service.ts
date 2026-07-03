import tmdbClient from '../config/tmdb';
import { AxiosRequestConfig } from 'axios';

export const tmdbGet = async <T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {}
): Promise<T> => {
  const config: AxiosRequestConfig = { params };
  const response = await tmdbClient.get<T>(endpoint, config);
  return response.data;
};
