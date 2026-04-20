# estateolution - Frontend Client

## Overview

This is the user interface for the estateolution system. Built with Nuxt 3, it provides a modern, responsive dashboard to manage real estate deals, track state transitions, view automated financial breakdowns, and monitor agent performance via analytical tables.

## Tech Stack

- Framework: Nuxt 3 (Vue 3, Composition API)
- State Management: Pinia
- Styling: Tailwind CSS
- Theming: Nuxt Color Mode (Dark/Light mode support)

## Prerequisites

- Node.js (v18 or higher recommended)
- The estateolution Backend API must be running.

## Installation

1. Navigate to the frontend directory and install dependencies:

```bash
npm install
```

2. Environment Configuration (Optional):
   By default, the application expects the backend API to be running on `http://localhost:3000`. If your backend is hosted elsewhere, create a `.env` file in the `frontend` directory:

```env
NUXT_PUBLIC_API_BASE=https://your-live-backend-url.com
```

## Running the Application

To start the development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3001`. (Port 3001 is explicitly configured in `nuxt.config.ts` to prevent port conflicts with the backend).
