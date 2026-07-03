import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiMapPin, FiUser } from 'react-icons/fi';
import { usePersonDetails, usePersonCredits } from '@/hooks/usePerson';
import { getProfileUrl, getFallbackPoster } from '@/utils/imageUtils';
import { formatDate } from '@/utils/formatUtils';
import { MovieCard } from '@/components/ui/MovieCard';
import { Footer } from '@/components/layout/Footer';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import { ErrorComponent } from '@/components/ui/ErrorComponent';

export const ActorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const personId = parseInt(id || '0');
  const navigate = useNavigate();
  const [showFullBio, setShowFullBio] = useState(false);

  const { data: person, isLoading, isError, error, refetch } = usePersonDetails(personId);
  const { data: credits } = usePersonCredits(personId);

  if (isLoading) return <DetailPageSkeleton />;
  if (isError || !person) return <ErrorComponent title="Person not found" message={error?.message} onRetry={() => refetch()} />;

  const knownMovies = credits?.cast
    ?.filter((c) => c.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 24) || [];

  const bio = person.biography || 'No biography available.';
  const truncatedBio = bio.length > 500 ? bio.slice(0, 500) + '...' : bio;

  return (
    <motion.div className="page-wrapper pt-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-150 mb-8">
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-ui">Back</span>
        </button>

        <div className="flex flex-col md:flex-row gap-10 mb-12">
          {/* Photo */}
          <div className="flex-shrink-0">
            <img
              src={getProfileUrl(person.profile_path, 'h632') || getFallbackPoster()}
              alt={person.name}
              className="w-48 md:w-60 rounded-card shadow-modal"
              onError={(e) => { (e.target as HTMLImageElement).src = getFallbackPoster(); }}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-h1 font-black text-white mb-2">{person.name}</h1>
            {person.known_for_department && (
              <p className="text-brand-red font-medium text-ui mb-4">{person.known_for_department}</p>
            )}

            <div className="flex flex-col gap-2 mb-6">
              {person.birthday && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  <span className="text-ui">
                    Born: {formatDate(person.birthday)}
                    {person.deathday && ` — Died: ${formatDate(person.deathday)}`}
                  </span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <FiMapPin className="w-4 h-4" />
                  <span className="text-ui">{person.place_of_birth}</span>
                </div>
              )}
              {person.also_known_as && person.also_known_as.length > 0 && (
                <div className="flex items-start gap-2 text-text-secondary">
                  <FiUser className="w-4 h-4 mt-0.5" />
                  <span className="text-ui">Also known as: {person.also_known_as.slice(0, 3).join(', ')}</span>
                </div>
              )}
            </div>

            {person.biography && (
              <div>
                <h2 className="text-h3 font-semibold text-white mb-2">Biography</h2>
                <p className="text-text-secondary text-body leading-relaxed">
                  {showFullBio ? bio : truncatedBio}
                </p>
                {bio.length > 500 && (
                  <button
                    onClick={() => setShowFullBio((s) => !s)}
                    className="text-brand-red text-ui mt-2 hover:text-brand-red-dark transition-colors"
                  >
                    {showFullBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Known For */}
        {knownMovies.length > 0 && (
          <section>
            <h2 className="text-h2 font-semibold text-white mb-4">Known For</h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {knownMovies.map((credit) => (
                <MovieCard
                  key={`${credit.media_type}-${credit.id}`}
                  item={{
                    ...credit,
                    title: credit.title || credit.name || '',
                    overview: '',
                    release_date: credit.release_date || credit.first_air_date || '',
                    media_type: credit.media_type || 'movie',
                    backdrop_path: null,
                    adult: false,
                    original_language: 'en',
                    video: false,
                    original_title: credit.title || '',
                    vote_count: 0,
                    genre_ids: [],
                  }}
                  mediaType={credit.media_type === 'tv' ? 'tv' : 'movie'}
                />
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </motion.div>
  );
};
