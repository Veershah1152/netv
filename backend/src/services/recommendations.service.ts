import { supabase } from '../config/supabase';
import { getMovieDetails, getSimilarMovies, getMovieRecommendations } from './movies.service';
import { getTvDetails, getSimilarTv } from './tv.service';
import { tmdbGet } from './tmdb.service';
import { PaginatedResponse } from '../models/common.model';
import { Movie } from '../models/movie.model';
import { TvShow } from '../models/tv.model';

interface RecommendationOutput {
  recommendedForYou: any[];
  becauseYouWatched: {
    sourceTitle: string;
    results: any[];
  } | null;
  similarToRecent: any[];
}

// In-memory cache for user recommendations
// Key: userId, Value: { data: RecommendationOutput, timestamp: number }
const recommendationCache: Record<string, { data: RecommendationOutput; timestamp: number }> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export const getUserRecommendations = async (userId: string): Promise<RecommendationOutput> => {
  const now = Date.now();
  const cached = recommendationCache[userId];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Fetch user data from Supabase
  const [watchedRes, watchlistRes, favoritesRes] = await Promise.all([
    supabase.from('watched_content').select('*').eq('user_id', userId).order('watched_at', { ascending: false }),
    supabase.from('watchlist').select('*').eq('user_id', userId),
    supabase.from('favorites').select('*').eq('user_id', userId),
  ]);

  const watched = watchedRes.data || [];
  const watchlist = watchlistRes.data || [];
  const favorites = favoritesRes.data || [];

  const watchedIds = new Set(watched.map((w) => `${w.media_type}-${w.movie_id}`));
  const watchlistIds = new Set(watchlist.map((w) => `${w.media_type}-${w.movie_id}`));

  const allInteractions = [...watched, ...watchlist, ...favorites];

  // If no user footprint yet, return default fallbacks
  if (allInteractions.length === 0) {
    // Fetch popular/trending fallbacks
    const [popularMovies, popularTv] = await Promise.all([
      tmdbGet<PaginatedResponse<Movie>>('/movie/popular', { page: 1 }),
      tmdbGet<PaginatedResponse<TvShow>>('/tv/popular', { page: 1 }),
    ]);

    const fallbackOutput: RecommendationOutput = {
      recommendedForYou: [...(popularMovies?.results || []), ...(popularTv?.results || [])].slice(0, 15),
      becauseYouWatched: null,
      similarToRecent: [],
    };
    recommendationCache[userId] = { data: fallbackOutput, timestamp: now };
    return fallbackOutput;
  }

  // 2. Fetch metadata of interacted items to extract genre profiles
  const sampleItems = allInteractions.slice(0, 10); // Check up to 10 latest interactions
  const genreCount: Record<number, number> = {};

  await Promise.all(
    sampleItems.map(async (item) => {
      try {
        if (item.media_type === 'movie') {
          const detail = await getMovieDetails(item.movie_id);
          detail?.genres?.forEach((g) => {
            genreCount[g.id] = (genreCount[g.id] || 0) + 1;
          });
        } else {
          const detail = await getTvDetails(item.movie_id);
          detail?.genres?.forEach((g) => {
            genreCount[g.id] = (genreCount[g.id] || 0) + 1;
          });
        }
      } catch {
        // Ignore single fetch failures
      }
    })
  );

  // Get top 2 genres
  const sortedGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .map((entry) => entry[0]);

  const topGenreId = sortedGenres[0];

  // 3. Recommended For You: Discover by top genre
  let recommendedForYou: any[] = [];
  if (topGenreId) {
    try {
      const discoverMovies = await tmdbGet<PaginatedResponse<Movie>>('/discover/movie', {
        with_genres: topGenreId,
        sort_by: 'popularity.desc',
      });
      const discoverTv = await tmdbGet<PaginatedResponse<TvShow>>('/discover/tv', {
        with_genres: topGenreId,
        sort_by: 'popularity.desc',
      });
      recommendedForYou = [
        ...(discoverMovies?.results?.map((m) => ({ ...m, media_type: 'movie' })) || []),
        ...(discoverTv?.results?.map((t) => ({ ...t, media_type: 'tv' })) || []),
      ]
        .filter((item) => !watchedIds.has(`${item.media_type}-${item.id}`) && !watchlistIds.has(`${item.media_type}-${item.id}`))
        .sort(() => 0.5 - Math.random()) // shuffle
        .slice(0, 15);
    } catch {
      // Fallback if discover fails
    }
  }

  // 4. Because You Watched: Find the last watched item, query recommendations for it
  let becauseYouWatched: RecommendationOutput['becauseYouWatched'] = null;
  const lastWatched = watched[0];
  if (lastWatched) {
    try {
      let sourceTitle = 'Your Recent Watched';
      let results: any[] = [];

      if (lastWatched.media_type === 'movie') {
        const detail = await getMovieDetails(lastWatched.movie_id);
        if (detail) {
          sourceTitle = detail.title;
          const recs = await getMovieRecommendations(lastWatched.movie_id);
          results = recs?.results?.map((m) => ({ ...m, media_type: 'movie' })) || [];
        }
      } else {
        const detail = await getTvDetails(lastWatched.movie_id);
        if (detail) {
          sourceTitle = detail.name;
          const recs = await getSimilarTv(lastWatched.movie_id);
          results = recs?.results?.map((t) => ({ ...t, media_type: 'tv' })) || [];
        }
      }

      becauseYouWatched = {
        sourceTitle,
        results: results
          .filter((item) => !watchedIds.has(`${item.media_type}-${item.id}`) && !watchlistIds.has(`${item.media_type}-${item.id}`))
          .slice(0, 12),
      };
    } catch {
      // Fallback
    }
  }

  // 5. Similar to Recent Watches: Check similar items for up to 3 recently watched titles
  const recentWatchedItems = watched.slice(0, 3);
  let similarToRecent: any[] = [];

  if (recentWatchedItems.length > 0) {
    try {
      const similarPromises = recentWatchedItems.map(async (item) => {
        try {
          if (item.media_type === 'movie') {
            const res = await getSimilarMovies(item.movie_id);
            return res?.results?.map((m) => ({ ...m, media_type: 'movie' })) || [];
          } else {
            const res = await getSimilarTv(item.movie_id);
            return res?.results?.map((t) => ({ ...t, media_type: 'tv' })) || [];
          }
        } catch {
          return [];
        }
      });

      const similarResults = await Promise.all(similarPromises);
      similarToRecent = similarResults
        .flat()
        .filter((item) => !watchedIds.has(`${item.media_type}-${item.id}`) && !watchlistIds.has(`${item.media_type}-${item.id}`))
        .filter((item, index, self) => self.findIndex((i) => i.id === item.id && i.media_type === item.media_type) === index) // deduplicate
        .slice(0, 15);
    } catch {
      // Fail silently
    }
  }

  const output: RecommendationOutput = {
    recommendedForYou: recommendedForYou.length > 0 ? recommendedForYou : fallbackRecommended(),
    becauseYouWatched,
    similarToRecent,
  };

  recommendationCache[userId] = { data: output, timestamp: now };
  return output;
};

// Clear cache when user footprint modifications occur
export const clearUserRecommendationsCache = (userId: string) => {
  delete recommendationCache[userId];
};

const fallbackRecommended = () => [];
