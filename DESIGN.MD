# Real Estate Transaction Management System - Architecture & Design

## 1. Overview

This project is a full-stack system designed to manage the lifecycle of real estate transactions from the agreement stage to completion. It aims to automate manual processes, eliminate human errors, ensure full traceability, and accurately calculate complex commission distributions between the agency and the agents.

## 2. System Architecture & Tech Stack

- **Backend:** NestJS, TypeScript, MongoDB Atlas, Mongoose
- **Frontend:** Nuxt 3, Vue 3, Pinia, Tailwind CSS
- **Architecture Pattern:** Modular Domain-Driven Design (DDD). Business logic (commission calculation, state machine validation) is strictly separated from controllers.

## 3. Database Design & Modeling Decisions

- **Embedded Financial Breakdown:** The commission reports are embedded directly into the `Transaction` document as a `financialBreakdown` object.
  - _Why Embedded, Not Dynamic?_ Computing commissions dynamically on-the-fly is a financial anti-pattern. If the agency's commission policy changes in the future, calculating dynamically would alter the historical data of past transactions. Embedding acts as an immutable snapshot.
- **Traceability (`stageHistory`):** A history array is kept inside the transaction document to track _when_ the transaction entered a specific stage. This explicitly fulfills the "Ensures traceability" requirement of the project.
- **Transaction Types:** Distinguished via `transactionType` (`sale` vs. `rental`) to allow future analytical queries.

## 4. State Machine & Transition Rules

- **Domain-Level Enforcement:** State transition validation is strictly handled within the **Service Layer** (Domain Logic), not in API Pipes or Interceptors. Pipes are only used for DTO payload validation.
- **Strict Linear Transition:**
  - `agreement` -> `earnest_money`
  - `earnest_money` -> `title_deed`
  - `title_deed` -> `completed`
- _Edge Case (Cancellations):_ A `cancelled` state has been added. Any state (except `completed`) can transition to `cancelled`. Relevant metadata (`cancellationReason`, `cancelledAt`) is tracked.

## 5. Commission Calculation Rules (Business Logic)

Triggered automatically only when a transaction transitions to the `completed` state.

- **Agency Share:** 50% of the `totalServiceFee` is allocated to the agency.
- **Agents Share:** The remaining 50% is distributed among the agents:
  - **Scenario 1:** If the listing and selling agent are the same person, they receive the full 100% of the agent portion.
  - **Scenario 2:** If the listing and selling agents are different, the agent portion is split equally (50% of the agent pool to each).

## 6. Frontend Structure & State Management

- **Store Structure:** `useTransactionStore` (manages lists, selected transaction, and loading/error states).
- **API Communication:** Centralized via a composable (`useTransactionApi`) wrapping `$fetch`.
- **Key Pages & Component Architecture:**
  - `/transactions` — Dashboard with a list/data-table view.
  - `/transactions/:id` — Unified detail view using modular components (`<TransactionTimeline />`, `<FinancialBreakdownCard />`).
