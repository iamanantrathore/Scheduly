# Scheduly — Calendly Clone

A full-stack scheduling/booking web application that replicates Calendly's design and user experience.

## 🚀 Live Demo

Run locally following the setup instructions below.

## 🛠 Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 19 + Vite + TailwindCSS 4         |
| Backend    | Node.js + Express 4                     |
| Database   | SQLite (via `better-sqlite3`)           |
| Routing    | React Router 7                          |
| HTTP Client| Axios                                   |
| Icons      | Lucide React                            |

## 📁 Project Structure

```
apps/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── server.js         # Express app entry point (port 3001)
│   │   ├── database.js       # SQLite schema & connection
│   │   ├── seed.js           # Seed data
│   │   └── routes/
│   │       ├── eventTypes.js # CRUD for event types
│   │       ├── availability.js # Weekly availability settings
│   │       ├── bookings.js   # Public booking flow + slot generation
│   │       └── meetings.js   # Meetings list + cancellation
│   ├── data/                 # SQLite database file (auto-created)
│   └── package.json
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── App.jsx           # Router setup
│   │   ├── components/
│   │   │   ├── Layout.jsx    # Admin sidebar layout
│   │   │   ├── EventTypeCard.jsx
│   │   │   ├── EventTypeModal.jsx
│   │   │   ├── MeetingCard.jsx
│   │   │   ├── Calendar.jsx  # Month calendar component
│   │   │   └── TimeSlots.jsx # Available time slots grid
│   │   └── pages/
│   │       ├── EventTypes.jsx    # Admin: Event Types management
│   │       ├── Availability.jsx  # Admin: Weekly schedule
│   │       ├── Meetings.jsx      # Admin: Upcoming/past meetings
│   │       ├── BookingPage.jsx   # Public: Calendar + booking form
│   │       └── Confirmation.jsx  # Public: Booking confirmation
│   └── package.json
│
└── README.md
```

## 🗄 Database Schema

```sql
-- Event types (meeting templates)
CREATE TABLE event_types (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  duration    INTEGER NOT NULL,   -- in minutes
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  color       TEXT DEFAULT '#0069ff',
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Weekly availability schedule
CREATE TABLE availability (
  id           TEXT PRIMARY KEY,
  day_of_week  INTEGER NOT NULL,  -- 0=Sunday … 6=Saturday
  start_time   TEXT NOT NULL,     -- "09:00"
  end_time     TEXT NOT NULL,     -- "17:00"
  is_active    INTEGER DEFAULT 1  -- 1=enabled, 0=disabled
);

-- Bookings / meetings
CREATE TABLE bookings (
  id              TEXT PRIMARY KEY,
  event_type_id   TEXT NOT NULL,
  invitee_name    TEXT NOT NULL,
  invitee_email   TEXT NOT NULL,
  start_time      TEXT NOT NULL,  -- ISO datetime
  end_time        TEXT NOT NULL,
  status          TEXT DEFAULT 'active',  -- 'active' | 'cancelled'
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (event_type_id) REFERENCES event_types(id)
);
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Run the Backend

```bash
cd backend
npm start          # Production
# or
npm run dev        # Development (with nodemon hot-reload)
```

The API server starts at **http://localhost:3001**  
The SQLite database is auto-created at `backend/data/scheduly.db`  
Seed data is inserted automatically on first run.

### 3. Run the Frontend

```bash
cd frontend
npm run dev
```

The app opens at **http://localhost:5173**

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/event-types` | List all event types |
| POST | `/api/event-types` | Create event type |
| PUT | `/api/event-types/:id` | Update event type |
| DELETE | `/api/event-types/:id` | Delete event type |
| GET | `/api/event-types/slug/:slug` | Get event type by slug |
| GET | `/api/availability` | Get weekly availability |
| PUT | `/api/availability` | Update weekly availability |
| GET | `/api/booking/:slug/slots?date=YYYY-MM-DD` | Get available slots |
| POST | `/api/booking/:slug` | Create a booking |
| GET | `/api/meetings?type=upcoming\|past` | List meetings |
| GET | `/api/meetings/:id` | Get meeting details |
| PUT | `/api/meetings/:id` | Update/reschedule a meeting |
| DELETE | `/api/meetings/:id` | Cancel a meeting |
| GET | `/api/health` | Health check |

## ✨ Features

### Admin (no login required — default admin user assumed)
- **Event Types** — Create, edit, delete meeting types with name, duration, slug, description, color
- **Availability** — Toggle days on/off, set start/end times per day
- **Meetings** — View upcoming and past meetings; edit/reschedule or delete upcoming meetings

### Public Booking
- Visit `/:slug` to open a booking page for any event type
- Month calendar with past dates and unavailable days disabled
- Click a date to see available 30-minute slots (respects availability settings)
- Fill in name and email, submit to confirm
- Confirmation page with Google Calendar link
- **Double-booking prevention** — booked slots are excluded from the available list
- **Email notifications** — real emails are sent on booking create, update, and delete when SMTP is configured

### Email configuration (Backend)

Set these environment variables before starting `backend`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_FROM`
- `SMTP_USER` (optional, if SMTP auth is required)
- `SMTP_PASS` (optional, if SMTP auth is required)
- `SMTP_SECURE` (`true` for SMTPS, optional)

## 🌱 Seed Data

On first startup the database is seeded with:
- 3 event types: **30 Minute Meeting**, **60 Minute Meeting**, **15 Minute Quick Chat**
- Availability: Monday – Friday, 9:00 AM – 5:00 PM
- 3 upcoming bookings + 2 past bookings

## 📝 Assumptions

1. A single default admin user is assumed to be logged in at all times for admin pages.
2. Timezone display is informational (UTC by default); slot times are stored and served in UTC.
3. The public booking page is accessible at `/:slug` without authentication.
4. SQLite is used for simplicity; the schema is PostgreSQL-compatible and can be migrated by swapping the `better-sqlite3` driver for `pg`.
