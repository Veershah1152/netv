import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getMovieRecommendations, getSimilarMovies } from '../services/movies.service';
import { getTvRecommendations, getSimilarTv } from '../services/tv.service';
import { searchMovies, searchTv } from '../services/search.service';
import { discoverMovies } from '../services/discover.service';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

// TMDB Genre ID maps with smart keyword mappings
const GENRE_MAP: { [key: string]: number } = {
  action: 28,
  fight: 28,
  adventure: 12,
  animation: 16,
  cartoon: 16,
  comedy: 35,
  funny: 35,
  laugh: 35,
  crime: 80,
  police: 80,
  detective: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  kids: 10751,
  fantasy: 14,
  magic: 14,
  history: 36,
  historical: 36,
  horror: 27,
  scary: 27,
  spooky: 27,
  ghost: 27,
  music: 10402,
  musical: 10402,
  mystery: 9648,
  romance: 10749,
  romantic: 10749,
  love: 10749,
  scifi: 878,
  sciencefiction: 878,
  space: 878,
  future: 878,
  alien: 878,
  robot: 878,
  thriller: 53,
  thrill: 53,
  war: 10752,
  western: 37,
};

export const getAiRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim() === '') {
    res.status(400).json({ message: 'Query string is required' });
    return;
  }

  const cleanedQuery = query.toLowerCase().trim();

  // 1. Try to see if this is an exact title lookup
  const movieSearchResults = await searchMovies(cleanedQuery, 1);
  const tvSearchResults = await searchTv(cleanedQuery, 1);

  const topMovie = movieSearchResults.results?.[0];
  const topTv = tvSearchResults.results?.[0];

  const movieTitle = topMovie?.title?.toLowerCase() || '';
  const tvTitle = topTv?.name?.toLowerCase() || '';

  const isMovieMatch = !!topMovie && !!movieTitle && (movieTitle.includes(cleanedQuery) || cleanedQuery.includes(movieTitle));
  const isTvMatch = !!topTv && !!tvTitle && (tvTitle.includes(cleanedQuery) || cleanedQuery.includes(tvTitle));

  if (isMovieMatch || isTvMatch) {
    if (isMovieMatch && (!topTv || (topMovie.popularity > topTv.popularity))) {
      const recommendations = await getMovieRecommendations(topMovie.id, 1);
      const similar = await getSimilarMovies(topMovie.id, 1);
      
      const combined = [
        ...(recommendations.results || []),
        ...(similar.results || [])
      ].filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);

      res.json({
        type: 'title_match',
        matchedItem: {
          id: topMovie.id,
          title: topMovie.title,
          overview: topMovie.overview,
          poster_path: topMovie.poster_path,
          media_type: 'movie',
        },
        results: combined.slice(0, 18),
      });
      return;
    } else if (topTv) {
      const recommendations = await getTvRecommendations(topTv.id, 1);
      const similar = await getSimilarTv(topTv.id, 1);
      
      const combined = [
        ...(recommendations.results || []),
        ...(similar.results || [])
      ].filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx);

      res.json({
        type: 'title_match',
        matchedItem: {
          id: topTv.id,
          title: topTv.name,
          overview: topTv.overview,
          poster_path: topTv.poster_path,
          media_type: 'tv',
        },
        results: combined.slice(0, 18),
      });
      return;
    }
  }

  // 2. Descriptive Prompt Mode
  let finalResults: any[] = [];
  let geminiUsed = false;

  // A. Use free Google Gemini Model if key is available
  if (config.gemini.apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const prompt = `Act as an expert movie and TV show recommendation assistant.
The user wants recommendations matching this request: "${cleanedQuery}"

Return up to 12 movie or TV show recommendations.
For each recommendation, output a JSON array of strings containing the exact titles.
Do not output markdown, reasoning, backticks, or formatting other than a raw JSON array.
Example Output:
["Interstellar", "Blade Runner 2049", "The Matrix", "Arrival"]`;

      const geminiResult = await model.generateContent(prompt);
      const responseText = geminiResult.response.text().trim();

      // Clean up markdown block identifiers if model outputted them
      const cleanedText = responseText
        .replace(/```json/gi, '')
        .replace(/```/gi, '')
        .trim();

      const parsedTitles = JSON.parse(cleanedText);

      if (Array.isArray(parsedTitles) && parsedTitles.length > 0) {
        // Resolve title names to exact TMDB movies
        const resolvedMovies: any[] = [];
        for (const title of parsedTitles.slice(0, 12)) {
          try {
            const tmdbSearch = await searchMovies(title, 1);
            if (tmdbSearch.results && tmdbSearch.results.length > 0) {
              resolvedMovies.push(tmdbSearch.results[0]);
            }
          } catch (e) {
            // Ignore individual movie resolution issues
          }
        }


        if (resolvedMovies.length > 0) {
          finalResults = resolvedMovies;
          geminiUsed = true;
        }
      }
    } catch (e) {
      console.error('[Gemini AI] Failed to generate recommendations, falling back to graph search:', e);
    }
  }

  // B. Fallback: Graph Expansion Algorithm (runs if Gemini is disabled or fails)
  if (!geminiUsed) {
    const searchTerms = cleanedQuery
      .split(/\s+/)
      .filter(word => word.length > 2 && !['movies', 'movie', 'shows', 'show', 'series', 'recommend', 'recommendation', 'helper', 'films', 'film', 'like', 'about', 'with'].includes(word));

    const anchorMovies: any[] = [];

    if (searchTerms.length > 0) {
      const combinedSearch = await searchMovies(searchTerms.join(' '), 1);
      if (combinedSearch.results && combinedSearch.results.length > 0) {
        anchorMovies.push(...combinedSearch.results.slice(0, 2));
      }

      for (const term of searchTerms.slice(0, 2)) {
        const termSearch = await searchMovies(term, 1);
        if (termSearch.results && termSearch.results.length > 0) {
          anchorMovies.push(termSearch.results[0]);
        }
      }
    } else {
      const defaultSearch = await searchMovies(cleanedQuery, 1);
      if (defaultSearch.results) {
        anchorMovies.push(...defaultSearch.results.slice(0, 3));
      }
    }

    const uniqueAnchors = anchorMovies.filter(
      (item, idx, self) => self.findIndex(t => t.id === item.id) === idx
    );

    let combinedRecommendations: any[] = [];

    for (const anchor of uniqueAnchors.slice(0, 3)) {
      try {
        const recs = await getMovieRecommendations(anchor.id, 1);
        const sims = await getSimilarMovies(anchor.id, 1);
        if (recs.results) combinedRecommendations.push(...recs.results);
        if (sims.results) combinedRecommendations.push(...sims.results);
      } catch (e) {
        // Ignore failure
      }
    }

    let graphResults = combinedRecommendations
      .filter((item, idx, self) => self.findIndex(t => t.id === item.id) === idx)
      .filter(item => !uniqueAnchors.some(anchor => anchor.id === item.id))
      .sort((a, b) => b.popularity - a.popularity);

    if (graphResults.length < 6) {
      const normalizedQuery = cleanedQuery.replace(/-/g, '').replace(/\s+/g, '');
      const matchedGenres: number[] = [];
      Object.keys(GENRE_MAP).forEach((key) => {
        if (normalizedQuery.includes(key)) {
          matchedGenres.push(GENRE_MAP[key]);
        }
      });

      if (matchedGenres.length > 0) {
        const uniqueGenres = [...new Set(matchedGenres)];
        const discoverData = await discoverMovies({
          with_genres: uniqueGenres.join('|'),
          sort_by: 'popularity.desc',
        });
        graphResults = discoverData.results || [];
      } else {
        const generalSearch = await searchMovies(cleanedQuery, 1);
        graphResults = generalSearch.results || [];
      }
    }

    finalResults = graphResults;
  }

  res.json({
    type: 'semantic_match',
    results: finalResults.slice(0, 18),
  });
  return;
});
