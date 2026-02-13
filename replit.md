# Greenlife Solar Solutions

## Overview
A React-based website for Greenlife Solar Solutions, a solar energy company in Nigeria. The site features product catalog, gallery, packages, consultation forms, user dashboard, and admin panel.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4
- **Backend/Database**: Supabase (external)
- **Animations**: GSAP
- **Routing**: React Router DOM v6

## Project Structure
- `App.tsx` / `index.tsx` - Main app entry and routing
- `components/` - Reusable UI components (admin, dashboard, shared)
- `pages/` - Page components (Public, Auth, Admin, User)
- `context/` - React context providers (Auth, Cart, Gallery, Admin)
- `config/` - Supabase client configuration
- `data/` - Static product data
- `types/` - TypeScript type definitions
- `public/` - Static assets

## Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development
- Dev server: `npm run dev` (runs on port 5000)
- Build: `npm run build` (outputs to `dist/`)

## Deployment
- Static deployment with build step
- Build output directory: `dist`
