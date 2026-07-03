import client from './client';

export interface RecommendationData {
  recommendedForYou: any[];
  becauseYouWatched: {
    sourceTitle: string;
    results: any[];
  } | null;
  similarToRecent: any[];
}

export const getRecommendations = async (): Promise<RecommendationData> => {
  const response = await client.get('/recommendations');
  return response.data.data;
};
