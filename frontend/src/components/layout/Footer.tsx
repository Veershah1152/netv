import React from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  ['Home', '/'],
  ['Movies', '/movies'],
  ['TV Shows', '/tv'],
  ['Trending', '/trending'],
  ['Popular', '/popular'],
  ['Top Rated', '/top-rated'],
  ['Discover', '/discover'],
  ['Favorites', '/favorites'],
];

export const Footer: React.FC = () => (
  <footer className="bg-nv-black border-t border-nv-border mt-16 py-12 px-8 md:px-12">
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-xl font-black text-brand-red tracking-widest">NETVEER</span>
        <span className="text-text-muted text-small">Powered by TMDB</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {FOOTER_LINKS.map(([label, path]) => (
          <Link
            key={path}
            to={path}
            className="text-text-secondary hover:text-white text-ui transition-colors duration-150"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="border-t border-nv-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-text-muted text-small">
          © {new Date().getFullYear()} NetVeer. This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-white text-small transition-colors duration-150"
        >
          Data by TMDB
        </a>
      </div>
    </div>
  </footer>
);
