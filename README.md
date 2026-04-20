# estateolution - Real Estate Transaction Management System

## Overview

estateolution is a robust, full-stack application designed to automate and manage the lifecycle of real estate transactions. Built for an estate agency consultancy, it mitigates human error by strictly enforcing state machine transitions (from initial agreement to completion), ensures complete traceability, and automatically calculates complex commission distributions between the agency and its agents.

This repository is structured as a **Monorepo** containing both the `backend` (NestJS) and `frontend` (Nuxt 3) applications.

---

## Live Demo

- **Live Frontend Application:** https://estateolution.vercel.app
- **Live Backend API:** https://estateolution-api.onrender.com/

---

## Tech Stack

**Backend:**

- Node.js (LTS), TypeScript
- NestJS
- MongoDB Atlas & Mongoose
- Jest (For Unit Testing)

**Frontend:**

- Nuxt 3 (Vue 3, Composition API)
- Pinia (State Management)
- Tailwind CSS (Styling)
- Nuxt Color Mode (Dark/Light Theme)

---

## Installation & Run Instructions

### 1. Database Setup

Ensure you have a MongoDB instance running (locally or via MongoDB Atlas).

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` directory and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/estateolution?retryWrites=true&w=majority
   ```
4. Start the backend server:
   ```bash
   npm run start:dev
   ```
   _The backend will run on `http://localhost:3000`._

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. _(Optional)_ If your backend is not running on `localhost:3000`, create a `.env` file in the `frontend` directory:
   ```env
   NUXT_PUBLIC_API_BASE=http://your-custom-backend-url:3000
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   _The frontend will run on `http://localhost:3001` (specifically configured to avoid port conflicts with the backend)._

---

## Running Unit Tests

Unit tests strictly cover the core business logic, including commission calculation rules, strict stage transitions, and MongoDB aggregations.

Navigate to the backend directory and run:

```bash
cd backend
npm run test
```

---

## Architecture & Design Decisions

For a deep dive into the architectural decisions, database schema design, State Machine logic, and UI/UX choices, please read the [DESIGN.md](./DESIGN.md) file included in this repository.
