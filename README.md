# EventSync - AI-Powered Event Scheduler

A full-stack event scheduling application with user accounts, invitations, status tracking, search, and an AI assistant that can create/edit/delete events through natural language.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Clerk (auth), React Router, Lucide Icons
- **Backend:** Express 5, Prisma 7 (ORM), SQLite, Clerk (auth middleware), Google Gemini AI
- **Language:** TypeScript throughout

## Features

- **Event Management:** Create, edit, and delete events with title, date/time, location, and description
- **Status Tracking:** RSVP to events as "Upcoming", "Attending", "Maybe", or "Declined"
- **User Accounts:** Sign up / sign in via Clerk (email, Google, GitHub, etc.)
- **Invitations:** Invite users by email; shows their profile (avatar + name) if they already have an account
- **Search:** Find events by title, date range, location, or description
- **AI Assistant:** Floating chat panel powered by Google Gemini that can:
  - Create events: _"Schedule a team meeting tomorrow at 3pm in Room A"_
  - Edit events: _"Move the standup to 10am"_
  - Delete events: _"Cancel the Friday lunch"_
  - Set RSVP status: _"Mark me as attending the birthday party"_
- **Modern UI:** Glass-morphism cards, gradient headers, animated badges, responsive layout

## Prerequisites

- Node.js >= 20
- A [Clerk](https://clerk.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (for Gemini)

## Getting Started

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** (`backend/.env`):

```env
DATABASE_URL="file:./dev.db"
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
GOOGLE_GENAI_API_KEY=YOUR_GEMINI_KEY
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Frontend** (`frontend/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
VITE_API_URL=http://localhost:3001
```

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the app

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

## Project Structure

```
backend/
  src/
    index.ts          Express server with all API endpoints
    prisma.ts         Prisma client setup with SQLite adapter
  prisma/
    schema.prisma     Database schema (User, Event, Invitation)
  generated/prisma/   Auto-generated Prisma client

frontend/
  src/
    main.tsx          Entry point (Clerk + Router providers)
    App.tsx           Route definitions
    index.css         Tailwind v4 + custom styles
    lib/
      api.ts          Typed API client with auth token injection
      utils.ts        Utility functions (cn, date formatting, etc.)
    components/
      Layout.tsx      App shell with gradient header
      EventCard.tsx   Event card with date badge, status, owner
      EventForm.tsx   Create/edit event modal
      SearchBar.tsx   Search input with date/location filters
      StatusBadge.tsx Colored RSVP status pill
      InviteModal.tsx Invite users with autocomplete
      AiAssistant.tsx Floating AI chat panel
    pages/
      Dashboard.tsx   Event grid with tabs + search
      EventDetail.tsx Full event view with RSVP + guests
      SignIn.tsx      Clerk sign-in page
      SignUp.tsx      Clerk sign-up page
```

## API Endpoints

| Method | Path                                | Description             |
| ------ | ----------------------------------- | ----------------------- |
| GET    | `/api/health`                       | Health check            |
| GET    | `/api/events`                       | List user's events      |
| POST   | `/api/events`                       | Create event            |
| GET    | `/api/events/:id`                   | Get event detail        |
| PATCH  | `/api/events/:id`                   | Update event            |
| DELETE | `/api/events/:id`                   | Delete event            |
| POST   | `/api/events/:id/invitations`       | Invite user by email    |
| PATCH  | `/api/events/:id/status`            | Set RSVP status         |
| DELETE | `/api/events/:eid/invitations/:iid` | Remove invitation       |
| GET    | `/api/search`                       | Search events           |
| GET    | `/api/users/search`                 | Search users for invite |
| POST   | `/api/ai`                           | AI assistant endpoint   |

## Deployment

- **Frontend:** Deploy to Vercel or Netlify. Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` env vars.
- **Backend:** Deploy to Railway, Render, or Fly.io. Set all backend env vars. The SQLite database file is stored locally, so for production consider switching to PostgreSQL.
