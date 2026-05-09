# E-FUEL - Mobile Fuel Delivery App

A production-ready mobile fuel delivery application built with React Native (Expo) and Node.js.

## 📁 Project Structure

This repository contains two main directories:
- `/backend` - Node.js + Express API server with MongoDB Atlas
- `/frontend` - Expo React Native mobile application

## 🚀 Getting Started

### 1. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Ensure you have a MongoDB Atlas connection string ready.
   - The `.env` file has been pre-configured with a placeholder database connection. You may edit `.env` and replace `MONGODB_URI` with your own.
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5000`*

### 2. Frontend Setup

1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Expo development server:
   ```bash
   npm start
   ```
4. **To view the app:**
   - **iOS:** Press `i` to open in iOS Simulator
   - **Android:** Press `a` to open in Android Emulator
   - **Physical Device:** Download the "Expo Go" app on your phone and scan the QR code from the terminal.

## ✨ Features Implemented (Day 1)

**Backend:**
- Express server with MVC architecture
- MongoDB Atlas connection with Mongoose
- Models: `User`, `Driver`, `Order`
- JWT Authentication & Authorization
- Global error handling
- CRUD endpoints for Auth, Orders, and Drivers

**Frontend:**
- Expo Router file-based navigation
- Dark Mode modern UI with gradient accents
- Zustand for state management
- Axios with interceptors for API calls
- Screens: Splash, Onboarding, Login, Register, Home, Orders, Profile
- Reusable UI Components: `Button`, `Input`, `Card`, `Badge`, `FuelCard`

## 🎨 Design System

E-FUEL uses a premium dark mode aesthetic:
- **Background**: Deep Navy (`#0A0E17`)
- **Primary Color**: Emerald/Teal Gradient (`#00D4AA` → `#00B4D8`)
- **Secondary Color**: Accent Orange (`#FF6B35`)
- Glass-morphism elements and micro-animations for an interactive feel.
