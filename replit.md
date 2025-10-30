# MijnZorgMatch.nl

## Overview
MijnZorgMatch.nl is een matchingplatform voor de Nederlandse zorg sector dat twee gebruikersgroepen met elkaar verbindt:
- **ZZP'ers (Zorgprofessionals)**: Zoeken naar opdrachten en advertenties van bureaus
- **Zorgorganisaties / Bureaus**: Plaatsen advertenties en zoeken professionals

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Replit Auth (OpenID Connect)
- **Real-time**: WebSocket (planned for chat)

## Project Structure
```
client/
  src/
    components/     # Reusable UI components
    pages/         # Page components
    hooks/         # Custom React hooks
    lib/           # Utilities and helpers
server/
  routes.ts      # API endpoints
  storage.ts     # Database operations
  db.ts          # Database connection
  replitAuth.ts  # Authentication setup
shared/
  schema.ts      # Database schema and types
```

## User Roles & Features

### ZZP'er (Zorgprofessional)
- Create and manage professional profile
- Browse vacancies from organisations
- Browse help requests from parents/caregivers
- Apply to opportunities
- Chat with matches

### Zorgorganisatie (Care Organisation)
- Post and manage vacancies
- View applications from ZZP'ers
- Chat with candidates
- Dashboard with analytics

### Ouder/Mantelzorger (Parent/Caregiver)
- Browse ZZP'er profiles
- Post and manage help requests
- View applications from professionals
- Chat with matches

## Database Schema
- **users**: User accounts with Replit Auth + online/offline status tracking
- **zzp_profiles**: Professional profiles for ZZP'ers
- **vacancies**: Job postings with hourly rate, education level, and response time tracking
- **help_requests**: Care requests from parents/caregivers
- **applications**: Responses to vacancies/requests/profiles (auto-converted to first message)
- **messages**: Chat messages between users with read status

## Design System
- Color palette: Healthcare-focused blues and neutral tones
- Typography: Inter font family
- Components: shadcn/ui with custom healthcare styling
- Dark mode: Fully supported
- Responsive: Mobile-first approach

## Current Status
✅ Schema and data models defined with extended fields
✅ Authentication with role selection and online/offline tracking
✅ Role-based dashboards with analytics
✅ Profile creation forms
✅ Vacancy and help request forms with filters
✅ Landing page with marketing content
✅ Backend API implementation (messages, applications, vacancies)
✅ Real-time notification system with sound and pop-ups
✅ Advanced filtering (location, salary, education level)
✅ Response time tracking for organizations
✅ Customer service contact page
⏳ WebSocket chat system (planned for future)

## Development Commands
- `npm run dev` - Start development server
- `npm run db:push` - Push schema changes to database
- `npm run build` - Build for production

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET` - Session encryption key (auto-configured by Replit)
- `REPL_ID` - Replit application ID (auto-configured by Replit)
- `PORT` - Server port (defaults to 5000)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (optional, for payments)
- `STRIPE_SECRET_KEY` - Stripe secret key (optional, for payments)

## Recent Updates (October 30, 2025)
✅ Extended database schema with hourlyRate, educationLevel, responseTime fields
✅ Implemented automatic application-to-message conversion for seamless chat
✅ Added notification system with sound alerts and toast notifications
✅ Built response time tracking (capped at 24 hours) for organizations
✅ Added hourly rate display in vacancy listings and details
✅ Implemented advanced filters: location, salary range, education level
✅ User names now shown in applications instead of generic labels
✅ Created customer service page with contact info (Info@mijnzorgmatch.nl)
✅ Online/offline status system ready (backend complete, visual indicators pending)

## Setup Status (October 30, 2025)
✅ Database provisioned and schema pushed
✅ Server running on port 5000
✅ Frontend configured for Replit proxy
✅ Email/password authentication working
✅ Credits page made Stripe-optional
✅ Deployment configuration set up (autoscale)
⏳ Stripe integration (optional - use blueprint:javascript_stripe when needed)

## Notes
- All content is in Dutch (NL)
- Focus on professional yet approachable design
- Emphasis on trust and safety in healthcare context
- SEO optimized with Dutch meta tags
- Payments are optional - app works without Stripe configuration
- To enable payments, add Stripe integration using Replit's integration system
