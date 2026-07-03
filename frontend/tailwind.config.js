/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E50914',
          'red-dark': '#831010',
          'red-muted': '#B20710',
        },
        nv: {
          black: '#141414',
          surface: '#1F1F1F',
          elevated: '#2D2D2D',
          card: '#1a1a1a',
          border: 'rgba(255,255,255,0.08)',
          glass: 'rgba(20,20,20,0.85)',
        },
        match: '#46D369',
        'badge-new': '#54B9C5',
      },
      fontFamily: {
        sans: ['"Netflix Sans"', 'Arial', 'Helvetica', 'sans-serif'],
      },
      fontSize: {
        hero: ['52px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        h1: ['36px', { lineHeight: '1.2' }],
        h2: ['24px', { lineHeight: '1.3' }],
        h3: ['18px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.5' }],
        ui: ['14px', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        small: ['12px', { lineHeight: '1.4' }],
      },
      backgroundImage: {
        'gradient-fade': 'linear-gradient(to top, #141414, transparent)',
        'gradient-hero': 'linear-gradient(to right, #141414 30%, transparent)',
        'gradient-nav': 'linear-gradient(to bottom, #141414, transparent)',
        'gradient-card': 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
      },
      boxShadow: {
        card: '0 6px 24px rgba(0,0,0,0.7)',
        modal: '0 12px 48px rgba(0,0,0,0.8)',
        glow: '0 0 20px rgba(229,9,20,0.4)',
      },
      borderRadius: {
        btn: '4px',
        card: '6px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
        'pulse-red': 'pulseRed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      screens: {
        xs: '500px',
        tv: '1800px',
      },
    },
  },
  plugins: [],
};
