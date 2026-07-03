import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Movie } from '@/types/movie.types';
import { TvShow } from '@/types/tv.types';

export type FavoriteItem = (Movie | TvShow) & { media_type: 'movie' | 'tv' };

export interface WatchProgress {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  progress: number;       // seconds elapsed
  duration: number;       // total duration in seconds
  watchedAt: string;
  // TV specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
}

/** Helper to look up saved progress for a specific title */
export const getSavedProgress = (
  watchProgress: WatchProgress[],
  id: number,
  media_type: 'movie' | 'tv',
  season?: number,
  episode?: number
): WatchProgress | undefined => {
  return watchProgress.find((w) => {
    if (w.id !== id || w.media_type !== media_type) return false;
    if (media_type === 'tv') {
      return w.season === season && w.episode === episode;
    }
    return true;
  });
};

export interface RecentlyViewedItem {
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  title: string;
  poster_path: string | null;
  viewedAt: string;
}

interface AppState {
  // Favorites
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: number, media_type: string) => void;
  isFavorite: (id: number, media_type: string) => boolean;

  // Continue Watching
  watchProgress: WatchProgress[];
  updateWatchProgress: (item: WatchProgress) => void;
  removeFromContinueWatching: (id: number, media_type: string) => void;

  // Recently Viewed
  recentlyViewed: RecentlyViewedItem[];
  addRecentlyViewed: (item: RecentlyViewedItem) => void;
  clearRecentlyViewed: () => void;

  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Favorites
      favorites: [],
      addFavorite: (item) =>
        set((state) => ({
          favorites: state.favorites.some(
            (f) => f.id === item.id && f.media_type === item.media_type
          )
            ? state.favorites
            : [item, ...state.favorites],
        })),
      removeFavorite: (id, media_type) =>
        set((state) => ({
          favorites: state.favorites.filter(
            (f) => !(f.id === id && f.media_type === media_type)
          ),
        })),
      isFavorite: (id, media_type) =>
        get().favorites.some((f) => f.id === id && f.media_type === media_type),

      // Continue Watching
      watchProgress: [],
      updateWatchProgress: (item) =>
        set((state) => ({
          watchProgress: [
            item,
            ...state.watchProgress.filter((w) => {
              if (w.id !== item.id || w.media_type !== item.media_type) return true;
              // For TV: keep other episodes, remove only same s/e
              if (item.media_type === 'tv') {
                return !(w.season === item.season && w.episode === item.episode);
              }
              return false; // movie: remove old entry
            }),
          ].slice(0, 30),
        })),
      removeFromContinueWatching: (id, media_type) =>
        set((state) => ({
          watchProgress: state.watchProgress.filter(
            (w) => !(w.id === id && w.media_type === media_type)
          ),
        })),

      // Recently Viewed
      recentlyViewed: [],
      addRecentlyViewed: (item) =>
        set((state) => ({
          recentlyViewed: [
            item,
            ...state.recentlyViewed.filter((r) => !(r.id === item.id && r.media_type === item.media_type)),
          ].slice(0, 50),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'netveer-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
