# E-FUEL — Mobile Fuel Delivery App

A fuel-delivery application: order fuel from your phone/browser and have it
delivered to your location. Built with **React Native (Expo, web-first)** +
**Node.js/Express** + **MongoDB**.

## 📁 Project Structure

- `/backend` — Express REST API + MongoDB (Mongoose)
- `/frontend` — Expo app (optimised for web)

## ✅ Prerequisites

- Node.js 18+
- A MongoDB database — local or Atlas (see step 1 below)

---

## 🚀 Quick Start

### 1. Database

You need a MongoDB connection string in `backend/.env` (`MONGODB_URI`).
Pick **one** option:

**Option A — Local MongoDB (already installed on this machine)**

A MongoDB 7.0 binary is installed at `~/.efuel-mongodb`. Start it with:

```bash
cd backend
npm run db:local      # keep this terminal open — it runs the database
```

`.env` is already pointed at it: `mongodb://127.0.0.1:27017/efuel`.

**Option B — MongoDB Atlas (free, recommended for your demo/submission)**

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>
2. Create a **free M0 cluster**.
3. **Database Access** → add a database user (username + password).
4. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere).
5. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/efuel?retryWrites=true&w=majority`
6. Paste it into `backend/.env` as `MONGODB_URI` (replace `USER`/`PASS`,
   and keep `/efuel` as the database name).

### 2. Install Dependencies

You can install dependencies for both frontend and backend at once from the root directory:

```bash
# Di folder root E-FUEL (bukan di dalam backend/frontend)
npm run install-all
```

*(Opsional) Buat akun admin dan driver demo:*
```bash
npm run seed
```

### 3. Run the App

Instead of opening two terminals, you can run both the frontend and backend concurrently from the root directory:

```bash
# Di folder root E-FUEL
npm run dev
```

This single command will:
1. Start the API server on `http://localhost:5001`
2. Start the Expo web app in your browser

---

## 👤 Demo Account

After running `npm run seed`:

- **Email:** `demo@efuel.com`
- **Password:** `demo123`

Or just register a new account from the app.

---

## ✨ Features

### Day 1 — Foundation
- Express MVC backend, MongoDB Atlas-ready
- Models: `User`, `Driver`, `Order`
- Web-first premium UI, Expo Router, Zustand, Axios

### Day 2 — Auth System
- **Backend:** register & login API, JWT, bcrypt password hashing,
  auth middleware (`protect`), protected routes
- **Frontend:** login & register screens with **real form validation**
  and server error messages, JWT token persisted
  (localStorage on web / SecureStore on native), logout,
  auth-aware protected navigation

### Day 3 — Order & Maps
- **Fuel selection** — E-Fuel Ignite (RON 92), Blaze (RON 95),
  Quantum (RON 98), Diesel (CN 51); prices fetched from the backend
- **Liter input** — quick-select, manual, and "by nominal (Rp)" modes
- **Interactive map** — OpenStreetMap / Leaflet (no API key); click the
  map or drag the pin to set the delivery point
- **GPS location** — `expo-location` + reverse geocoding (auto-fills the address)
- **Create order API** — orders are saved to MongoDB
- **Orders screen** — live list with status badges and order cancellation

---

## 🔌 API Endpoints

Base URL: `http://localhost:5001/api`

| Method | Endpoint               | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | `/auth/register`       | —    | Register a new user      |
| POST   | `/auth/login`          | —    | Log in, returns JWT      |
| GET    | `/auth/profile`        | ✅   | Current user profile     |
| PUT    | `/auth/profile`        | ✅   | Update profile           |
| GET    | `/orders/prices`       | —    | Fuel products & prices   |
| POST   | `/orders`              | ✅   | Create an order          |
| GET    | `/orders`              | ✅   | List my orders           |
| GET    | `/orders/:id`          | ✅   | Get one order            |
| PUT    | `/orders/:id/cancel`   | ✅   | Cancel an order          |

---

## 📝 Notes

- The backend runs on **port 5001** — port 5000 is used by the macOS
  AirPlay Receiver. If you change it, update `backend/.env` (`PORT`) and
  `frontend/services/api.ts` (`getApiUrl`).
- Maps use **OpenStreetMap** via Leaflet — completely free, no API key.
- The design follows a **web-first** layout.
