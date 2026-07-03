import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiHeart,
  FiUser,
  FiSettings,
  FiClock,
  FiEye,
  FiUsers,
  FiCheckSquare,
  FiLogOut
} from 'react-icons/fi';
import { SearchBar } from '@/components/ui/SearchBar';
import { useAuthStore } from '@/store/useAuthStore';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: '🤖 AI Helper', path: '/ai-helper' },
  { label: 'Movies', path: '/movies' },
  { label: 'TV Shows', path: '/tv' },
  { label: 'New & Popular', path: '/trending' },
  { label: 'Discover', path: '/discover' },
  { label: 'My List', path: '/favorites' },
];

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled
            ? 'rgba(20,20,20,0.98)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 h-16">
          {/* Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center">
              <motion.span
                className="text-2xl font-black text-brand-red tracking-widest select-none"
                whileHover={{ scale: 1.05 }}
              >
                NETVEER
              </motion.span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-ui transition-colors duration-150 hover:text-white ${
                    location.pathname === link.path
                      ? 'text-white font-medium'
                      : 'text-text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block">
              <SearchBar
                isExpanded={searchOpen}
                onClose={() => setSearchOpen(false)}
              />
            </div>

            {/* Favorites */}
            <motion.button
              className="hidden md:flex items-center justify-center w-9 h-9 text-text-secondary hover:text-white transition-colors duration-150"
              onClick={() => navigate('/favorites')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Favorites"
            >
              <FiHeart className="w-5 h-5" />
            </motion.button>

            {/* Profile Dropdown or Sign In */}
            {!user ? (
              <Link
                to="/auth"
                className="bg-brand-red hover:bg-brand-red-dark text-white text-small font-bold px-4 py-2 rounded-btn transition-colors duration-150"
              >
                Sign In
              </Link>
            ) : (
              <div className="relative hidden md:block">
                <motion.button
                  className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-150"
                  onClick={() => setProfileOpen((p) => !p)}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-white" />
                  </div>
                </motion.button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-nv-elevated border border-nv-border rounded-card shadow-modal overflow-hidden"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                    >
                      {[
                        { icon: FiHeart, label: 'Favorites', path: '/favorites' },
                        { icon: FiCheckSquare, label: 'Watched History', path: '/watched' },
                        { icon: FiUsers, label: 'Social Hub', path: '/friends' },
                        { icon: FiClock, label: 'Continue Watching', path: '/continue-watching' },
                        { icon: FiEye, label: 'Recently Viewed', path: '/recently-viewed' },
                        { icon: FiSettings, label: 'Settings', path: '/settings' },
                      ].map(({ icon: Icon, label, path }) => (
                        <button
                          key={path}
                          onClick={() => { navigate(path); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:text-white hover:bg-nv-surface transition-colors duration-150 text-ui border-b border-nv-border/20 last:border-none"
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={async () => {
                          await signOut();
                          setProfileOpen(false);
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-brand-red hover:bg-brand-red/10 transition-colors duration-150 text-ui border-t border-nv-border/20"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-white"
              onClick={() => setMobileMenuOpen((p) => !p)}
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-nv-black/95 backdrop-blur-sm lg:hidden pt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col p-6 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-lg py-3 border-b border-nv-border transition-colors duration-150 ${
                    location.pathname === link.path
                      ? 'text-white font-semibold'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 space-y-2">
                {user ? (
                  <>
                    {[
                      { label: 'Favorites', path: '/favorites' },
                      { label: 'Watched History', path: '/watched' },
                      { label: 'Social Hub', path: '/friends' },
                      { label: 'Continue Watching', path: '/continue-watching' },
                      { label: 'Recently Viewed', path: '/recently-viewed' },
                      { label: 'Settings', path: '/settings' },
                    ].map(({ label, path }) => (
                      <Link
                        key={path}
                        to={path}
                        className="block text-text-muted hover:text-white py-2 text-ui"
                      >
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={async () => {
                        await signOut();
                        setMobileMenuOpen(false);
                        navigate('/');
                      }}
                      className="block text-brand-red text-left w-full py-2 text-ui"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    className="block bg-brand-red hover:bg-brand-red-dark text-white text-center font-bold py-2 rounded-btn transition-colors duration-150"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close profile */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </>
  );
};
