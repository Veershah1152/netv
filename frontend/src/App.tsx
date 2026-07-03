import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { BackToTop } from '@/components/ui/BackToTop';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorComponent';
import { useAuthStore } from '@/store/useAuthStore';

// Lazy load all pages for code splitting
const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Trending = lazy(() => import('@/pages/Trending').then((m) => ({ default: m.Trending })));
const Popular = lazy(() => import('@/pages/Popular').then((m) => ({ default: m.Popular })));
const TopRated = lazy(() => import('@/pages/TopRated').then((m) => ({ default: m.TopRated })));
const Upcoming = lazy(() => import('@/pages/Upcoming').then((m) => ({ default: m.Upcoming })));
const Movies = lazy(() => import('@/pages/Movies').then((m) => ({ default: m.Movies })));
const TvShows = lazy(() => import('@/pages/TvShows').then((m) => ({ default: m.TvShows })));
const Discover = lazy(() => import('@/pages/Discover').then((m) => ({ default: m.Discover })));
const MovieDetails = lazy(() => import('@/pages/MovieDetails').then((m) => ({ default: m.MovieDetails })));
const TvDetails = lazy(() => import('@/pages/TvDetails').then((m) => ({ default: m.TvDetails })));
const Watch = lazy(() => import('@/pages/Watch').then((m) => ({ default: m.Watch })));
const WatchTv = lazy(() => import('@/pages/WatchTv').then((m) => ({ default: m.WatchTv })));
const ActorDetails = lazy(() => import('@/pages/ActorDetails').then((m) => ({ default: m.ActorDetails })));
const Search = lazy(() => import('@/pages/Search').then((m) => ({ default: m.Search })));
const Favorites = lazy(() => import('@/pages/Favorites').then((m) => ({ default: m.Favorites })));
const ContinueWatching = lazy(() => import('@/pages/ContinueWatching').then((m) => ({ default: m.ContinueWatching })));
const RecentlyViewed = lazy(() => import('@/pages/RecentlyViewed').then((m) => ({ default: m.RecentlyViewed })));
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const Auth = lazy(() => import('@/pages/Auth').then((m) => ({ default: m.Auth })));
const Watched = lazy(() => import('@/pages/Watched').then((m) => ({ default: m.Watched })));
const Friends = lazy(() => import('@/pages/Friends').then((m) => ({ default: m.Friends })));
const WatchParty = lazy(() => import('@/pages/WatchParty').then((m) => ({ default: m.WatchParty })));
const AIHelper = lazy(() => import('@/pages/AIHelper').then((m) => ({ default: m.AIHelper })));
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })));

function App() {
  const location = useLocation();
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);


  return (
    <ErrorBoundary>
      <Navbar />
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/top-rated" element={<TopRated />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TvShows />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TvDetails />} />
            <Route path="/watch/movie/:id" element={<Watch />} />
            <Route path="/watch/tv/:id" element={<WatchTv />} />
            <Route path="/actor/:id" element={<ActorDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/continue-watching" element={<ContinueWatching />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watched" element={<Watched />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/party/:id" element={<WatchParty />} />
            <Route path="/ai-helper" element={<AIHelper />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <BackToTop />
    </ErrorBoundary>
  );
}

export default App;
