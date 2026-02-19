# EventSync - AI-Powered Event Scheduler

A full-stack event scheduling application with user accounts, invitations, status tracking, search, and an AI assistant that can create/edit/delete events through natural language.

## Tech Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS v4, Clerk (auth), React Router, Lucide Icons
- **Backend:** Express 5, Prisma 7 (ORM), SQLite, Clerk (auth middleware), Google Gemini AI
- **Language:** TypeScript throughout

## Features

- **Event Management:** Create, edit, and delete events with title, date/time, location, and description
- **Duplicate Events:** Clone any event with one click to quickly create similar events
- **Export to Calendar:** Download events as `.ics` files compatible with Google Calendar, Apple Calendar, Outlook, etc.
- **Share Events:** Copy event details to clipboard for quick sharing
- **Status Tracking:** RSVP to events as "Upcoming", "Attending", "Maybe", or "Declined"
- **RSVP Summary:** See at-a-glance counts of attending, maybe, and declined guests
- **User Accounts:** Sign up / sign in via Clerk (email, Google, GitHub, etc.)
- **Invitations:** Invite users by email; shows their profile (avatar + name) if they already have an account
- **Search:** Find events by title, date range, location, or description
- **Dashboard Stats:** Overview cards showing total events, upcoming, completed, and organized counts
- **Happening Today:** Highlighted section at the top of the dashboard for events happening today
- **Sort Events:** Sort by date (ascending/descending), title A-Z, or recently created
- **Relative Time:** Events display human-friendly time like "in 2h" or "3d ago"
- **Attendee Avatars:** Stacked avatar previews of attending guests on event cards
- **Past Event Indicators:** Visual distinction between upcoming and past events
- **Skeleton Loading:** Smooth shimmer loading animations instead of spinners
- **Dynamic Page Titles:** Browser tab title updates based on current page/event
- **AI Assistant:** Floating chat panel powered by Google Gemini that can:
  - Create events: _"Schedule a team meeting tomorrow at 3pm in Room A"_
  - Edit events: _"Move the standup to 10am"_
  - Delete events: _"Cancel the Friday lunch"_
  - Set RSVP status: _"Mark me as attending the birthday party"_
- **Toast Notifications:** Non-intrusive success/error/info notifications for all actions
- **Confirmation Dialogs:** Safe, styled confirmation modals for destructive actions
- **Keyboard Shortcuts:**
  - `Ctrl+K` / `Cmd+K` — Focus search bar
  - `Escape` — Close any open modal or the AI chat panel
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
    main.tsx          Entry point (Clerk + Router + Toast providers)
    App.tsx           Route definitions
    index.css         Tailwind v4 + custom styles
    lib/
      api.ts              Typed API client with auth token injection
      utils.ts            Utility functions (cn, dates, displayName, etc.)
      useKeyboard.ts      Keyboard shortcut hooks (useEscape, useKeydown)
      useDocumentTitle.ts Dynamic browser tab title hook
    components/
      Layout.tsx          App shell with gradient header + footer
      AuthLayout.tsx      Shared auth page layout (sign-in/sign-up)
      EventCard.tsx       Event card with avatars, relative time, past badge
      EventCardSkeleton.tsx  Shimmer skeleton loading for event grids
      EventForm.tsx       Create/edit event modal with validation
      SearchBar.tsx       Search input with date/location filters
      StatusBadge.tsx     Colored RSVP status pill
      InviteModal.tsx     Invite users with autocomplete
      AiAssistant.tsx     Floating AI chat panel
      Avatar.tsx          Reusable avatar with fallback initials
      Toast.tsx           Toast notification system (provider + hook)
      ConfirmDialog.tsx   Styled confirmation modal for destructive actions
      StatsBar.tsx        Dashboard statistics summary cards
    pages/
      Dashboard.tsx       Events grid with tabs, search, sort, today section
      EventDetail.tsx     Full event view with RSVP, guests, export, duplicate
      SignIn.tsx           Clerk sign-in page
      SignUp.tsx           Clerk sign-up page
```

## API Endpoints

| Method | Path                                | Description              |
| ------ | ----------------------------------- | ------------------------ |
| GET    | `/api/health`                       | Health check             |
| GET    | `/api/events`                       | List user's events       |
| POST   | `/api/events`                       | Create event             |
| GET    | `/api/events/:id`                   | Get event detail         |
| PATCH  | `/api/events/:id`                   | Update event             |
| DELETE | `/api/events/:id`                   | Delete event             |
| POST   | `/api/events/:id/duplicate`         | Duplicate event          |
| GET    | `/api/events/:id/export`            | Export event as .ics     |
| POST   | `/api/events/:id/invitations`       | Invite user by email     |
| PATCH  | `/api/events/:id/status`            | Set RSVP status          |
| DELETE | `/api/events/:eid/invitations/:iid` | Remove invitation        |
| GET    | `/api/search`                       | Search events            |
| GET    | `/api/users/search`                 | Search users for invite  |
| POST   | `/api/ai`                           | AI assistant endpoint    |

## Deployment

- **Frontend:** Deploy to Vercel or Netlify. Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_URL` env vars.
- **Backend:** Deploy to Railway, Render, or Fly.io. Set all backend env vars. The SQLite database file is stored locally, so for production consider switching to PostgreSQL.
