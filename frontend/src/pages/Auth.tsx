import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/api/supabaseClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/components/ui/Toast';
import { FcGoogle } from 'react-icons/fc';


export const Auth: React.FC = () => {
  const { user, loading } = useAuthStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed');
      showToast(err.message || 'Google Sign-In failed', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        if (!username || username.trim() === '') {
          throw new Error('Username is required');
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;

        showToast('Account created! Please check your email or log in.', 'success');
        setIsSignUp(false); // Switch to sign in
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        showToast('Welcome back!', 'success');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.85)), url('https://images.unsplash.com/photo-1574267433382-44472c7333a5?q=80&w=1920')`,
      }}
    >
      <div className="absolute top-0 left-0 w-full p-6 z-10">
        <span
          className="text-2xl font-black text-brand-red tracking-widest cursor-pointer"
          onClick={() => navigate('/')}
        >
          NETVEER
        </span>
      </div>

      <motion.div
        className="w-full max-w-md bg-black/75 p-8 md:p-12 rounded-card border border-nv-border/20 backdrop-blur-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-white text-h2 font-bold mb-8">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <label className="block text-small text-text-secondary mb-2">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-nv-elevated border border-nv-border/40 focus:border-white/30 rounded px-4 py-3 text-white text-body outline-none transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-small text-text-secondary mb-2">Email Address</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-nv-elevated border border-nv-border/40 focus:border-white/30 rounded px-4 py-3 text-white text-body outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-small text-text-secondary mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-nv-elevated border border-nv-border/40 focus:border-white/30 rounded px-4 py-3 text-white text-body outline-none transition-colors"
            />
          </div>

          {errorMsg && (
            <p className="text-brand-red text-small font-semibold">
              ⚠️ {errorMsg}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={authLoading}
            className="w-full bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 rounded-btn text-ui transition-colors duration-150 relative overflow-hidden flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Divider OR */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-nv-border/40"></div>
          <span className="flex-shrink mx-4 text-text-muted text-small uppercase select-none">OR</span>
          <div className="flex-grow border-t border-nv-border/40"></div>
        </div>

        {/* Google OAuth Button */}
        <motion.button
          onClick={handleGoogleSignIn}
          className="w-full bg-white hover:bg-neutral-100 text-neutral-800 font-bold py-3 rounded-btn text-ui transition-colors duration-150 flex items-center justify-center gap-3 shadow-md"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FcGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </motion.button>

        <p className="text-text-muted text-small mt-8">
          {isSignUp ? 'Already have an account?' : 'New to NetVeer?'}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-white hover:underline font-bold"
          >
            {isSignUp ? 'Sign in now.' : 'Sign up now.'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
