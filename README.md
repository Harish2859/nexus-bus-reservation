# 🚌 NexusBus — Intercity Bus Reservation Platform

A full-stack, production-oriented bus reservation system built for real-world intercity travel. NexusBus supports two distinct user roles — **Passengers** who search and book seats, and **Operators** who manage fleets, deploy routes, and monitor live passenger manifests.

---

## 🌐 Live Deployment

| Layer    | Platform | URL |
| :------- | :------- | :-- |
| Frontend | Vercel   | `https://nexus-bus-reservation.vercel.app` |
| Backend  | Render   | Express API (configured via `VITE_API_URL`) |
| Database | Neon / Supabase (Cloud PostgreSQL) | Connected via `DATABASE_URL` |

---

## 🗂️ Project Structure

```
bus-reservation-system/
├── backend/
│   └── src/
│       ├── config/
│       │   ├── db.js               # PostgreSQL pool (cloud + local fallback)
│       │   └── validate.js         # Booking payload middleware validator
│       ├── controllers/
│       │   ├── authController.js   # Register, login (bcrypt + JWT)
│       │   ├── bookingController.js# Create booking (tx + seat lock), cancel
│       │   ├── busController.js    # Fleet CRUD, schedules, stats, manifest
│       │   ├── scheduleController.js# Public search, booked seat map
│       │   └── userController.js   # Passenger dashboard + booking history
│       ├── middleware/
│       │   └── authMiddleware.js   # JWT verify, operator role guard
│       └── routes/
│           ├── authRoutes.js       # /api/auth — login (rate-limited), register
│           ├── bookingRoutes.js    # /api/bookings — create, cancel
│           ├── busRoutes.js        # /api/buses — operator-scoped fleet ops
│           └── scheduleRoutes.js   # /api/schedules — public search + seat map
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── AuthModal.jsx       # Split-panel login/register modal
│       │   ├── BusResultCard.jsx   # Search result card with timeline UI
│       │   ├── ErrorBoundary.jsx   # React error boundary wrapper
│       │   ├── OperatorDashboard.jsx# Full operator portal (fleet, routes, stats)
│       │   ├── PassengerForm.jsx   # Per-seat passenger detail form + booking submit
│       │   ├── ScheduleManifest.jsx# Live manifest table + CSV export
│       │   ├── SearchDashboard.jsx # Origin/destination/date search form
│       │   ├── SeatSelector.jsx    # Interactive seat grid + fare summary
│       │   ├── Toast.jsx           # Global notification toast
│       │   └── UserProfile.jsx     # Passenger booking history + cancel
│       ├── context/
│       │   ├── AuthContext.jsx     # User session, token, login/logout
│       │   └── BookingContext.jsx  # Search state, seat selection, booking flow
│       ├── ui/                     # Presentational design system primitives
│       │   ├── Badge.jsx
│       │   ├── Button.jsx
│       │   ├── Card.jsx
│       │   ├── Input.jsx
│       │   ├── Layout.jsx
│       │   ├── ModalShell.jsx
│       │   ├── Select.jsx
│       │   └── Spinner.jsx
│       ├── App.jsx                 # App shell, routing, header, footer, landing
│       ├── index.css               # Global styles + Tailwind base
│       └── main.jsx                # React DOM entry point
└── README.md
```

---

## ⚙️ Tech Stack

### Backend
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `express` | ^5.2.1 | HTTP server and routing |
| `pg` | ^8.21.0 | PostgreSQL client (connection pool) |
| `bcryptjs` | ^3.0.3 | Password hashing (salt rounds: 10) |
| `jsonwebtoken` | ^9.0.3 | JWT auth tokens (24h expiry) |
| `express-rate-limit` | ^8.5.2 | Brute-force protection on `/login` |
| `cors` | ^2.8.6 | Origin whitelist (localhost + Vercel) |
| `dotenv` | ^17.4.2 | Environment variable loading |
| `nodemon` | ^3.1.14 | Dev auto-restart |

### Frontend
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` | ^19.2.6 | UI library |
| `react-dom` | ^19.2.6 | DOM renderer |
| `vite` | ^8.0.13 | Build tool and dev server |
| `tailwindcss` | ^4.3.0 | Utility-first CSS framework |
| `@vitejs/plugin-react` | ^6.0.2 | React fast refresh |

---

## 🗄️ Database Schema

All tables live in a single cloud PostgreSQL instance. Foreign keys are enforced at the DB level.

```sql
-- User accounts (passengers and operators)
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          user_role NOT NULL DEFAULT 'PASSENGER'  -- ENUM: PASSENGER | OPERATOR
);

-- Bus fleet (each bus is owned by one operator)
CREATE TABLE buses (
    bus_id      SERIAL PRIMARY KEY,
    bus_number  TEXT UNIQUE NOT NULL,
    bus_type    TEXT NOT NULL,           -- Seater | Sleeper | AC Seater | AC Sleeper | Sleeper + Seater
    total_seats INT NOT NULL,
    operator_id INT NOT NULL REFERENCES users(id)
);

-- Route schedules (each schedule is tied to one bus)
CREATE TABLE schedules (
    schedule_id        SERIAL PRIMARY KEY,
    bus_id             INT NOT NULL REFERENCES buses(bus_id),
    origin             TEXT NOT NULL,
    destination        TEXT NOT NULL,
    departure_time     TIMESTAMP NOT NULL,
    arrival_time       TIMESTAMP NOT NULL,
    base_price_seater  NUMERIC(10,2) NOT NULL,
    base_price_sleeper NUMERIC(10,2) DEFAULT 0.00
);

-- Booking ledger (one booking per user per transaction)
CREATE TABLE bookings (
    booking_id    SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id),
    schedule_id   INT NOT NULL REFERENCES schedules(schedule_id),
    total_amount  NUMERIC(10,2) NOT NULL,
    ticket_status TEXT NOT NULL DEFAULT 'CONFIRMED',  -- CONFIRMED | CANCELLED
    pnr_number    TEXT UNIQUE NOT NULL,
    booking_date  TIMESTAMP DEFAULT NOW()
);

-- Individual seat assignments per booking
CREATE TABLE passenger_seats (
    id               SERIAL PRIMARY KEY,
    booking_id       INT NOT NULL REFERENCES bookings(booking_id),
    schedule_id      INT NOT NULL REFERENCES schedules(schedule_id),
    seat_number      TEXT NOT NULL,
    passenger_name   TEXT NOT NULL,
    passenger_age    INT NOT NULL,
    passenger_gender TEXT NOT NULL,
    CONSTRAINT uq_seat_per_schedule UNIQUE (schedule_id, seat_number)
);
```

> The `UNIQUE(schedule_id, seat_number)` constraint on `passenger_seats` is the hard database-level guard against double-booking under concurrent load.

---

## 🔐 Security Architecture

### Authentication Flow
1. User registers → password hashed with `bcrypt` (10 salt rounds) → stored as `password_hash`
2. User logs in → `bcrypt.compare` → JWT signed with `JWT_SECRET` → returned to client
3. Client stores token in `localStorage` under key `nexus_token`
4. All protected routes read `Authorization: Bearer <token>` → `jwt.verify` in `authMiddleware.js`

### Concurrency & Seat Locking (Two-Layer Defense)
```
Request A ──┐
             ├──► SELECT FOR UPDATE on passenger_seats (Layer 1: row lock)
Request B ──┘         │
                       ▼
              If rows found → 409 Conflict (fast path)
              If no rows → INSERT proceeds
                       │
                       ▼
              DB UNIQUE constraint (Layer 2: phantom read guard)
              If violated → error.code === '23505' → 409 Conflict
```

### PNR Generation
```js
// crypto.randomBytes(3) → 3 bytes → 6 hex chars → 9-char PNR
// e.g. NXSA3F9C12
const generatePNR = () => 'NXS' + crypto.randomBytes(3).toString('hex').toUpperCase();
```
Backed by a `UNIQUE` constraint on `bookings.pnr_number` to prevent collision overlap.

### Rate Limiting
`/api/auth/login` is protected by `express-rate-limit`:
- **Window:** 15 minutes
- **Max attempts:** 15 per IP
- **Headers:** `RateLimit-*` standard headers returned
- **Response on breach:** `429` with `{ error: 'Too many login attempts...' }`

### Operator Data Isolation
Every operator-facing query in `busController.js` is scoped by `operator_id = req.user.id`:

| Endpoint | Isolation Method |
| :--- | :--- |
| `GET /api/buses/fleet` | `WHERE operator_id = $1` |
| `GET /api/buses/stats` | All subqueries join through `buses WHERE operator_id = $1` |
| `GET /api/buses/active-schedules` | `JOIN buses ... AND b.operator_id = $1` |
| `POST /api/buses/schedule` | Pre-insert ownership check on `bus_id` |
| `GET /api/buses/manifest/:id` | Schedule → bus → `operator_id` ownership gate before returning rows |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local) or a cloud connection string

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/bus-reservation-system.git
cd bus-reservation-system
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_key_here

# Option A — local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bus_reservation_db

# Option B — cloud connection string (overrides A)
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Run the schema SQL from the [Database Schema](#️-database-schema) section in your PostgreSQL client, then:
```bash
npm run dev
# Server running on port 5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
# Vite dev server at http://localhost:5173
```

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
| :----- | :------- | :--- | :---------- |
| `POST` | `/register` | ❌ | Create a new PASSENGER or OPERATOR account |
| `POST` | `/login` | ❌ | Authenticate and receive JWT (rate-limited: 15/15min) |
| `GET`  | `/dashboard` | ✅ JWT | Fetch passenger booking history |
| `POST` | `/cancel-booking` | ✅ JWT | Cancel a confirmed booking by `booking_id` |

**Register payload:**
```json
{ "name": "Priya Sharma", "email": "priya@example.com", "password": "securepass", "role": "PASSENGER" }
```

**Login payload:**
```json
{ "email": "priya@example.com", "password": "securepass" }
```

**Login response:**
```json
{ "success": true, "token": "<jwt>", "user": { "id": 1, "name": "Priya Sharma", "email": "...", "role": "PASSENGER" } }
```

---

### Schedules — `/api/schedules`

| Method | Endpoint | Auth | Description |
| :----- | :------- | :--- | :---------- |
| `GET`  | `/search` | ❌ | Search routes by origin, destination, date |
| `GET`  | `/:id/seats` | ❌ | Get all booked seat numbers for a schedule |

**Search query params:** `?origin=Chennai&destination=Bangalore&date=2025-08-15`

**Search response:**
```json
{
  "success": true,
  "results_count": 3,
  "schedules": [
    {
      "schedule_id": 12,
      "origin": "Chennai",
      "destination": "Bangalore",
      "departure_time": "2025-08-15T21:00:00.000Z",
      "arrival_time": "2025-08-16T03:00:00.000Z",
      "base_price_seater": "550.00",
      "base_price_sleeper": "950.00",
      "bus_number": "TN-01-AB-1234",
      "bus_type": "AC Sleeper",
      "total_seats": 40
    }
  ]
}
```

---

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
| :----- | :------- | :--- | :---------- |
| `POST` | `/create` | ✅ JWT | Create a booking with seat lock transaction |

**Create booking payload:**
```json
{
  "schedule_id": 12,
  "total_amount": 1100,
  "passengers": [
    { "seat_number": "S5", "passenger_name": "Priya Sharma", "passenger_age": 28, "passenger_gender": "Female" },
    { "seat_number": "S6", "passenger_name": "Aman Kumar",   "passenger_age": 31, "passenger_gender": "Male" }
  ]
}
```

**Success response:**
```json
{
  "success": true,
  "message": "Booking completed successfully!",
  "booking_id": 47,
  "pnr_number": "NXSA3F9C12",
  "seats_booked": ["S5", "S6"]
}
```

**Conflict response (seat taken):**
```json
{ "error": "The selected seat was just reserved by another passenger. Please choose a different seat." }
```

---

### Buses (Operator) — `/api/buses`

All routes require `Authorization: Bearer <token>` with `role: OPERATOR`.

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/add` | Register a new bus to the operator's fleet |
| `POST` | `/schedule` | Deploy a new route schedule |
| `GET`  | `/fleet` | List all buses owned by this operator |
| `GET`  | `/stats` | Revenue, booking count, fleet size (operator-scoped) |
| `GET`  | `/active-schedules` | Upcoming routes with live seat load |
| `GET`  | `/manifest/:scheduleId` | Full passenger manifest for a schedule |

**Add bus payload:**
```json
{ "bus_number": "KA-51-Z-9999", "bus_type": "AC Seater", "total_seats": 40 }
```

**Create schedule payload:**
```json
{
  "bus_id": 3,
  "origin": "Bangalore",
  "destination": "Goa",
  "departure_time": "2025-08-20 22:00:00",
  "arrival_time": "2025-08-21 07:00:00",
  "base_price_seater": 650,
  "base_price_sleeper": 1100
}
```

---

## 🖥️ Frontend Features

### Landing Page (`App.jsx`)
- Full-bleed hero banner with animated gradient background
- Floating search card overlapping the hero bottom edge
- Platform stats bar (500+ routes, 1.2M+ passengers, 4.8★, 200+ operators)
- Feature highlight cards (Instant Booking, Secure Payments, 500+ Routes, Live Seat Map)
- Popular routes grid (6 preset city pairs — click to auto-fill search)
- Passenger review cards
- Operator CTA section
- Full footer with route links, support, and legal columns

### Search & Results
- `SearchDashboard` — origin/destination text inputs with ⇄ swap button, date picker with past-date prevention, inline validation
- `BusResultCard` — departure/arrival timeline, duration calculation, AC badge, lowest fare display, expand/collapse seat selector

### Seat Selection (`SeatSelector.jsx`)
- 4-column bus layout (A, B, aisle, C, D) rendered dynamically from `total_seats`
- Three seat states: available (white), selected (blue gradient), occupied (grey ✕)
- Real-time occupancy fetched from `/api/schedules/:id/seats` on mount
- Sticky fare summary panel showing selected seat numbers and running total
- Proceeds to `PassengerForm` on "Book N seats →"

### Passenger Form (`PassengerForm.jsx`)
- One form card per selected seat, keyed by seat ID
- Fields: full name (text), age (number, 1–115), gender (Male/Female/Other)
- Client-side validation before API call
- Submits to `/api/bookings/create` with JWT header
- On success: shows PNR receipt card with booking confirmation

### Auth Modal (`AuthModal.jsx`)
- Split-panel layout: branded left panel (hidden on mobile) + form right panel
- Tab toggle between Sign In and Register
- Role selector on register: Passenger (🎫) or Bus Operator (🚌) — card-style toggle
- Show/hide password toggle
- Error display matches backend `{ error: '...' }` shape

### Passenger Profile (`UserProfile.jsx`)
- Sidebar: avatar initials card, stats pills (total/confirmed/cancelled/spent), nav tabs, account details
- Booking ticket cards with dashed divider, PNR in monospace, seat list, departure datetime, fare paid
- Per-ticket cancel button with confirmation dialog → optimistic UI update
- Filter tabs: All / Confirmed / Cancelled

### Operator Dashboard (`OperatorDashboard.jsx`)
- Gradient header band matching passenger profile layout
- Sidebar: operator card, fleet overview pills (buses/routes/bookings/revenue), navigation
- Overview tab: 4 stat cards + quick action buttons + live dispatch table (route, load bar, % utilization)
- Register Bus tab: bus number, type selector, seat count form
- Create Schedule tab: bus dropdown (own fleet only), route, departure/arrival date+time, seater/sleeper pricing
- Passenger Manifest tab: schedule ID input → `ScheduleManifest` component

### Schedule Manifest (`ScheduleManifest.jsx`)
- Fetches from `/api/buses/manifest/:scheduleId` with operator JWT
- Table columns: Seat, Passenger, Age/Gender, PNR, Status
- Cancelled rows rendered with red background + strikethrough
- Export CSV button — client-side Blob serialization, downloads as `manifest_schedule_<id>.csv`
- Footer row: confirmed count · cancelled count · total records

---

## 🔄 Booking Transaction Flow

```
Passenger selects seats
        │
        ▼
PassengerForm submits POST /api/bookings/create
        │
        ▼
authMiddleware.js — verifies JWT → attaches req.user
        │
        ▼
validateBookingPayload — checks schedule_id, passengers array
        │
        ▼
bookingController.createBooking
  ├── BEGIN transaction
  ├── SELECT seat_number FROM passenger_seats
  │   WHERE schedule_id = $1 AND seat_number = ANY($2)
  │   FOR UPDATE                          ← Layer 1: row lock
  ├── If rows found → ROLLBACK → 409
  ├── INSERT INTO bookings (pnr = crypto.randomBytes)
  ├── INSERT INTO passenger_seats (one row per passenger)
  │   └── UNIQUE(schedule_id, seat_number) ← Layer 2: phantom guard
  └── COMMIT → 201 { pnr_number, seats_booked }
```

---

## 🗺️ Sprint Roadmap (Post-Launch)

### ✅ Sprint 1 — Security & Core Stability (Completed)
- [x] `UNIQUE(schedule_id, seat_number)` DB constraint + `23505` catch in booking controller
- [x] `UNIQUE(pnr_number)` DB constraint + `crypto.randomBytes` PNR generation
- [x] `express-rate-limit` on `/api/auth/login` (15 req / 15 min)
- [x] Operator query scoping — all fleet/stats/manifest queries filtered by `operator_id`
- [x] Manifest PII fix — `booked_by_email` removed from manifest response

### 🔲 Sprint 2 — Passenger UX
- [ ] JWT `httpOnly` cookie migration (eliminate `localStorage` XSS vector)
- [ ] Refresh token loop — 7-day refresh token + 15-min access token rotation
- [ ] Age-group fare logic — child discounts, senior citizen pricing per passenger
- [ ] Boarding/dropping point arrays on schedules (`JSONB` columns)
- [ ] Payment gateway integration (Razorpay order → webhook → confirm)

### 🔲 Sprint 3 — Operator Telemetry
- [ ] Schedule status field (`ON_TIME / DELAYED / CANCELLED`) with operator toggle
- [ ] Auto-refresh dashboard stats (30s polling interval)
- [ ] Cancellation loss margin widget (revenue lost to cancelled tickets)
- [ ] Capacity utilization sortable column with colour-coded thresholds

---

## 🌍 Environment Variables Reference

### Backend (`backend/.env`)
```env
PORT=5000
JWT_SECRET=<your_secret>
DATABASE_URL=<cloud_postgres_connection_string>

# Local DB fallback (used when DATABASE_URL is absent)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<password>
DB_NAME=bus_reservation_db
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

### Frontend Production (`frontend/.env.production`)
```env
VITE_API_URL=https://<your-render-service>.onrender.com
```

---

## 📄 License

MIT — free to use, modify, and distribute.
