# Real Estate Transaction Management System - Architecture & Design

## 1. Overview

This project is a full-stack system designed to manage the lifecycle of real estate transactions from the agreement stage to completion. It aims to automate manual processes, eliminate human errors, ensure full traceability, and accurately calculate complex commission distributions between the agency and the agents.

## 2. System Architecture & Tech Stack

- **Backend:** NestJS, TypeScript, MongoDB Atlas, Mongoose
- **Frontend:** Nuxt 4, Vue 3, Pinia, Tailwind CSS
- **Architecture Pattern:** Modular Domain-Driven Design (DDD). Business logic (commission calculation, state machine validation) is strictly separated from controllers.

## 3. Database Design & Modeling Decisions

- **Embedded Financial Breakdown:** The commission reports are embedded directly into the `Transaction` document as a `financialBreakdown` object.
  - _Why Embedded, Not Dynamic?_ Computing commissions dynamically on-the-fly is a financial anti-pattern. If the agency's commission policy changes in the future, calculating dynamically would alter the historical data of past transactions. Embedding acts as an immutable snapshot.
- **Traceability (`stageHistory`):** A history array is kept inside the transaction document to track _when_ the transaction entered a specific stage. This explicitly fulfills the "Ensures traceability" requirement and is visualized as a Timeline UI on the frontend.
- **Pagination & Sorting:** Transactions are sorted by `updatedAt` (Last Updated) by default, which is the industry standard for CRM dashboards. Server-side pagination is implemented to ensure the application remains performant as the dataset grows.
- **Transaction Types:** Distinguished via `transactionType` (`sale` vs. `rental`) to allow future analytical queries.

## 4. State Machine & Transition Rules

- **Domain-Level Enforcement:** State transition validation is strictly handled within the **Service Layer** (Domain Logic), not in API Pipes or Interceptors. Pipes are only used for DTO payload validation.
- **Strict Linear Transition:**
  - `agreement` -> `earnest_money`
  - `earnest_money` -> `title_deed`
  - `title_deed` -> `completed`
- _Edge Case (Cancellations):_ A `cancelled` state is supported. Any state (except `completed`) can transition to `cancelled` along with a mandatory cancellation reason.

## 5. Business Intelligence & MongoDB Aggregations

To provide actionable insights without overloading the frontend or running expensive loops in Node.js, the system utilizes **MongoDB Aggregation Pipelines**.

- **`GET /transactions/stats`:** Calculates total deals, completed/cancelled ratios, and sums up the total agency earnings natively within the database.
- **`GET /transactions/agent-performance`:** Uses a complex pipeline (`$match`, `$unwind`, `$group`, `$lookup`, `$project`) to flatten the embedded financial breakdowns, join them with the Agents collection, and calculate a leaderboard of top-performing agents based on their total earnings and completed deal count.

## 6. Commission Calculation Rules (Core Business Logic)

Triggered automatically only when a transaction transitions to the `completed` state.

- **Agency Share:** 50% of the `totalServiceFee` is allocated to the agency.
- **Agents Share:** The remaining 50% is distributed among the agents:
  - **Scenario 1:** If the listing and selling agent are the same person, they receive the full 100% of the agent portion.
  - **Scenario 2:** If the listing and selling agents are different, the agent portion is split equally (50% of the agent pool to each).

## 7. Frontend Structure & State Management

- **State Management:** Pinia stores (`useTransactionStore`, `useAgentStore`) manage the reactive state, while API calls are abstracted into composables (`useTransactionApi`).
- **Modern UI/UX Patterns:**
  - **Theming:** Full Dark/Light mode integration using `@nuxtjs/color-mode` and Tailwind CSS.
  - **Feedback:** Integrated modern toast notifications for immediate, non-blocking user feedback.
