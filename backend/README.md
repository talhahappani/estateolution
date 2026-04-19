# estateolution - Backend API

## Overview

This is the backend service for the estateolution Real Estate Transaction Management System. Built with NestJS and MongoDB, it acts as the core engine enforcing domain rules. It handles strict state machine transitions for transactions, mathematical calculations for agent commissions, and exposes RESTful API endpoints for the frontend client.

## Tech Stack

- Framework: NestJS (TypeScript)
- Database: MongoDB Atlas (Mongoose ORM)
- Validation: class-validator, class-transformer
- Testing: Jest

## Prerequisites

- Node.js (v18 or higher recommended)
- A running MongoDB Atlas cluster

## Installation

1. Navigate to the backend directory and install dependencies:

```bash
npm install
```

2. Environment Configuration:
   Create a `.env` file in the root of the `backend` directory and configure your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/estateolution?retryWrites=true&w=majority
```

## Running the Application

To start the server in development mode:

```bash
npm run start:dev
```

The API will be accessible at `http://localhost:3000`.

## Running Unit Tests

Unit tests are mandatory for the core business logic (Commission rules and strict stage transitions). To run the test suite:

```bash
npm run test
```
