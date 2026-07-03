<div align="center">

# 🎬 NetVeer

### Full-Stack Movie & TV Streaming Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-F6821F?style=for-the-badge&logo=cloudflare&logoColor=white)](https://cloudflare.com/)

A production-ready streaming platform with AI recommendations, real-time Watch Together rooms, social features, and multi-player streaming — built with React, Express, Supabase, and Gemini AI.

</div>

---

## ✨ Features

### 🎬 Core Streaming
- **Multi-Player System** — 4 switchable players (Trailer, Player 1, 2, 3) with seamless switching
- **Upcoming Content Protection** — Future releases show a "Coming Soon" cinematic card with countdown
- **Mobile Ad-Shield** — Toggleable iframe sandbox blocker with step-by-step mobile ad-blocking guides

### 🤖 AI Recommendation Engine
- **Gemini AI Helper** — Type any movie name or mood description to get smart recommendations
- **Graph Expansion Algorithm** — TMDB similarity graph fallback ensures results even without API key
- **Personalized Home Rows** — "Recommended For You", "Because You Watched...", "Similar to Recent Watches"

### 👥 Social Features
- **Friends System** — Send/accept friend requests, search users, manage connections
- **Recommend to Friends** — Share movie/show recommendations directly to friends with personal messages
- **Watch Together Rooms** — Real-time synchronized viewing with Supabase Realtime Broadcast & Presence
- **Live Group Chat** — Chat with room participants while watching together

### 🔐 Authentication
- **Email + Password** via Supabase Auth
- **Google OAuth** one-click sign-in
- **Watched History** — Mark movies/shows as watched, stored in Supabase database

### 🎨 UI/UX
- **Dark Cinema Theme** — Deep blacks, crimson red accents, glassmorphism cards
- **Framer Motion** — Page transitions, hover animations, and micro-interactions
- **Fully Responsive** — Mobile, tablet, desktop, and TV layouts
- **Real-time Toasts** — Animated notification system

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NetVeer Architecture                    │
├──────────────────────┬──────────────────────────────────────┤
│   Frontend           │         Backend                       │
│   (React + Vite)     │         (Express + Node.js)          │
│                      │                                       │
│  ┌──────────────┐    │    ┌─────────────────────────────┐   │
│  │  React Pages │───▶│    │  /api/movie    /api/tv       │   │
│  │  Zustand     │    │    │  /api/social   /api/watched  │   │
│  │  TanStack Q  │    │    │  /api/parties  /api/ai       │   │
│  │  React Router│◀───│    └──────────────┬──────────────┘   │
│  └──────────────┘    │                   │                   │
│         │            │           ┌───────▼────────┐         │
│         │            │           │  External APIs │         │
│         ▼            │           │  TMDB API      │         │
│  ┌──────────────┐    │           │  Gemini AI     │         │
│  │  Supabase    │◀───│──────────▶│  Supabase DB   │         │
│  │  Auth+DB     │    │           └────────────────┘         │
│  └──────────────┘    │                                       │
└──────────────────────┴──────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type safety |
| **Vite 5** | Build tool with HMR |
| **Tailwind CSS 3** | Utility-first styling with custom design tokens |
| **Framer Motion** | Animations and page transitions |
| **TanStack Query** | Server state, caching, and retry |
| **Zustand** | Global client state with localStorage persistence |
| **React Router v6** | Client-side routing with lazy loading |
| **Supabase JS** | Auth, database, and realtime client |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type safety |
| **Supabase Admin** | Server-side DB auth verification |
| **Google Generative AI** | Gemini AI movie recommendations |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin resource sharing |
| **Morgan** | Request logging |
| **express-rate-limit** | API rate limiting |
| **Compression** | gzip response compression |

---

## 📋 Prerequisites

- **Node.js** 18+
- **npm** 9+
- **TMDB API Key** — free at [themoviedb.org](https://www.themoviedb.org/settings/api)
- **Supabase Project** — free at [supabase.com](https://supabase.com)
- **Gemini API Key** *(optional)* — free at [aistudio.google.com](https://aistudio.google.com)
- **Cloudflare Account** *(for deployment)* — free at [cloudflare.com](https://cloudflare.com)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/netveer.git
cd netveer

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** and run the schema below:

<details>
<summary>📄 Click to expand SQL Schema</summary>

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  updated_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Profiles viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Watched Content
create table public.watched_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  movie_id integer not null, media_type text check (media_type in ('movie','tv')) not null,
  watched_at timestamp with time zone default now(), season integer, episode integer
);
alter table public.watched_content enable row level security;
create policy "Users manage own watched" on public.watched_content for all using (auth.uid() = user_id);

-- Watchlist, Favorites, Friend Requests, Friends, Recommendations, Watch Parties
-- (see full schema in /docs/schema.sql)
```
</details>

3. Enable **Email + Google OAuth** in **Authentication → Providers**
4. Disable **Email Confirmation** in **Authentication → Providers → Email** for instant login

### 3. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
JWT_SECRET=your_long_random_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GEMINI_API_KEY=your_gemini_api_key  # Optional — starts with AIzaSy...
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

---

## ☁️ Cloudflare Deployment

### Backend → Cloudflare Workers

```bash
cd backend

# 1. Install Wrangler
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Add all secrets
wrangler secret put TMDB_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put GEMINI_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put FRONTEND_URL

# 4. Deploy
npm run worker:deploy
# → https://netveer-api.your-subdomain.workers.dev
```

### Frontend → Cloudflare Pages

```bash
cd frontend

# 1. Update VITE_API_URL in .env to your deployed Worker URL
# VITE_API_URL=https://netveer-api.your-subdomain.workers.dev/api

# 2. Deploy
npm run pages:deploy
# → https://netveer-frontend.pages.dev
```

---

## 📡 API Reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | ❌ | Health check |
| GET | `/api/trending` | ❌ | Trending movies & TV |
| GET | `/api/movie/:id` | ❌ | Movie details |
| GET | `/api/movie/:id/videos` | ❌ | Movie trailers |
| GET | `/api/movie/:id/cast` | ❌ | Movie cast |
| GET | `/api/movie/:id/recommendations` | ❌ | Movie recommendations |
| GET | `/api/movie/:id/similar` | ❌ | Similar movies |
| GET | `/api/tv/:id` | ❌ | TV show details |
| GET | `/api/tv/:id/season/:num` | ❌ | Season details |
| GET | `/api/search?q=` | ❌ | Multi-search |
| GET | `/api/discover` | ❌ | Discover with filters |
| GET | `/api/person/:id` | ❌ | Actor/person details |
| POST | `/api/ai/recommend` | ❌ | AI movie recommendations |
| GET | `/api/watched/status/:id` | ✅ | Check watched status |
| POST | `/api/watched/toggle` | ✅ | Toggle watched status |
| GET | `/api/watched/list` | ✅ | Get watched list |
| GET | `/api/social/friends/list` | ✅ | Friend list |
| POST | `/api/social/friends/request` | ✅ | Send friend request |
| POST | `/api/social/friends/accept` | ✅ | Accept friend request |
| POST | `/api/social/recommend` | ✅ | Recommend to friend |
| GET | `/api/social/recommendations` | ✅ | Received recommendations |
| POST | `/api/parties/create` | ✅ | Create watch party |
| GET | `/api/parties/:id` | ✅ | Get party details |

---

## 📁 Project Structure

```
netveer/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts           # Environment configuration
│   │   │   ├── supabase.ts      # Supabase admin client
│   │   │   └── tmdb.ts          # TMDB axios client
│   │   ├── controllers/
│   │   │   ├── ai.controller.ts      # Gemini AI recommendations
│   │   │   ├── movies.controller.ts  # Movie endpoints
│   │   │   ├── tv.controller.ts      # TV endpoints
│   │   │   ├── party.controller.ts   # Watch party endpoints
│   │   │   ├── social.controller.ts  # Friends & recommendations
│   │   │   └── watched.controller.ts # Watched history
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT verification middleware
│   │   │   ├── errorHandler.ts  # Global error handler
│   │   │   └── rateLimiter.ts   # API rate limiting
│   │   ├── routes/
│   │   │   ├── index.ts         # Route registry
│   │   │   ├── ai.routes.ts     # AI recommendation routes
│   │   │   └── ...              # Domain-specific routers
│   │   ├── services/
│   │   │   ├── tmdb.service.ts  # TMDB API wrapper
│   │   │   └── ...              # Domain services
│   │   ├── app.ts               # Express app initialization
│   │   ├── server.ts            # HTTP server (local dev)
│   │   └── worker.ts            # Cloudflare Worker entry
│   ├── wrangler.toml            # Cloudflare Worker config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios API layer
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer
│   │   │   └── ui/              # MovieCard, Hero, PlayerSwitcher, etc.
│   │   ├── hooks/               # TanStack Query hooks
│   │   ├── pages/               # All page components (25+)
│   │   ├── store/               # Zustand stores
│   │   ├── types/               # TypeScript interfaces
│   │   └── utils/               # Helpers & constants
│   ├── wrangler.toml            # Cloudflare Pages config
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🎯 Available Scripts

### Backend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run type-check` | TypeScript validation without building |
| `npm run worker:dev` | Run as Cloudflare Worker locally |
| `npm run worker:deploy` | Deploy to Cloudflare Workers |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run type-check` | TypeScript validation without building |
| `npm run pages:deploy` | Build and deploy to Cloudflare Pages |

---

## 🤝 Credits

- Movie & TV data powered by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- AI recommendations powered by [Google Gemini](https://aistudio.google.com/)
- Auth & database by [Supabase](https://supabase.com/)
- Deployed on [Cloudflare Pages & Workers](https://cloudflare.com/)

> This product uses the TMDB API but is not endorsed or certified by TMDB.
