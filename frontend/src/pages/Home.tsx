import React from 'react';
import { motion } from 'framer-motion';
import { Hero } from '@/components/ui/Hero';
import { MovieRow } from '@/components/ui/MovieRow';
import { Footer } from '@/components/layout/Footer';
import { ErrorComponent } from '@/components/ui/ErrorComponent';
import { HeroSkeleton } from '@/components/ui/Skeleton';
import { useTrending } from '@/hooks/useTrending';
import { usePopularMovies, useTopRatedMovies, useUpcomingMovies } from '@/hooks/useMovies';
import { usePopularTv, useTvOnTheAir } from '@/hooks/useTv';
import { useDiscover } from '@/hooks/useDiscover';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useAuthStore } from '@/store/useAuthStore';

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
};

export const Home: React.FC = () => {
  const { user } = useAuthStore();
  const { data: recs, isLoading: loadingRecs } = useRecommendations();
  const trending = useTrending();
  const popular = usePopularMovies();
  const topRated = useTopRatedMovies();
  const upcoming = useUpcomingMovies();
  const tvPopular = usePopularTv();
  const tvOnAir = useTvOnTheAir();

  // Genre-specific rows
  const action = useDiscover({ with_genres: '28', sort_by: 'popularity.desc' });
  const comedy = useDiscover({ with_genres: '35', sort_by: 'popularity.desc' });
  const animation = useDiscover({ with_genres: '16', sort_by: 'popularity.desc' });
  const romance = useDiscover({ with_genres: '10749', sort_by: 'popularity.desc' });
  const horror = useDiscover({ with_genres: '27', sort_by: 'popularity.desc' });
  const scifi = useDiscover({ with_genres: '878', sort_by: 'popularity.desc' });
  const crime = useDiscover({ with_genres: '80', sort_by: 'popularity.desc' });
  const documentary = useDiscover({ with_genres: '99', sort_by: 'popularity.desc' });

  if (trending.isError) {
    return (
      <ErrorComponent
        title="Failed to load content"
        message={trending.error?.message}
        onRetry={() => trending.refetch()}
      />
    );
  }

  return (
    <motion.div className="page-wrapper" {...pageTransition}>
      {/* Hero */}
      {trending.isLoading ? (
        <HeroSkeleton />
      ) : (
        <Hero items={trending.data?.results?.slice(0, 6) || []} />
      )}

      {/* Content Rows */}
      <div className="mt-2">
        <MovieRow
          title="Trending Now"
          items={trending.data?.results || []}
          isLoading={trending.isLoading}
          viewAllLink="/trending"
        />

        {user && (
          <>
            {/* Recommended For You */}
            <MovieRow
              title="Recommended For You"
              items={recs?.recommendedForYou || []}
              isLoading={loadingRecs}
            />

            {/* Because You Watched */}
            {recs?.becauseYouWatched && recs.becauseYouWatched.results.length > 0 && (
              <MovieRow
                title={`Because You Watched: ${recs.becauseYouWatched.sourceTitle}`}
                items={recs.becauseYouWatched.results}
                isLoading={loadingRecs}
              />
            )}

            {/* Similar to Recent Watches */}
            {recs?.similarToRecent && recs.similarToRecent.length > 0 && (
              <MovieRow
                title="Similar to Your Recent Watches"
                items={recs.similarToRecent}
                isLoading={loadingRecs}
              />
            )}
          </>
        )}
        <MovieRow
          title="Popular Movies"
          items={popular.data?.results || []}
          isLoading={popular.isLoading}
          mediaType="movie"
          viewAllLink="/popular"
        />
        <MovieRow
          title="Top Rated"
          items={topRated.data?.results || []}
          isLoading={topRated.isLoading}
          mediaType="movie"
          viewAllLink="/top-rated"
        />
        <MovieRow
          title="Coming Soon"
          items={upcoming.data?.results || []}
          isLoading={upcoming.isLoading}
          mediaType="movie"
          viewAllLink="/upcoming"
        />
        <MovieRow
          title="Popular TV Shows"
          items={tvPopular.data?.results || []}
          isLoading={tvPopular.isLoading}
          mediaType="tv"
          viewAllLink="/tv"
        />
        <MovieRow
          title="Now On Air"
          items={tvOnAir.data?.results || []}
          isLoading={tvOnAir.isLoading}
          mediaType="tv"
        />
        <MovieRow
          title="Action Movies"
          items={action.data?.results || []}
          isLoading={action.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=28"
        />
        <MovieRow
          title="Comedy"
          items={comedy.data?.results || []}
          isLoading={comedy.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=35"
        />
        <MovieRow
          title="Animation"
          items={animation.data?.results || []}
          isLoading={animation.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=16"
        />
        <MovieRow
          title="Romance"
          items={romance.data?.results || []}
          isLoading={romance.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=10749"
        />
        <MovieRow
          title="Horror"
          items={horror.data?.results || []}
          isLoading={horror.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=27"
        />
        <MovieRow
          title="Sci-Fi"
          items={scifi.data?.results || []}
          isLoading={scifi.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=878"
        />
        <MovieRow
          title="Crime"
          items={crime.data?.results || []}
          isLoading={crime.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=80"
        />
        <MovieRow
          title="Documentary"
          items={documentary.data?.results || []}
          isLoading={documentary.isLoading}
          mediaType="movie"
          viewAllLink="/discover?with_genres=99"
        />
      </div>

      <Footer />
    </motion.div>
  );
};
