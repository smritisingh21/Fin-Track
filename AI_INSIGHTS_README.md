# ✨ FinTrack AI Insights — Gemini API Integration Guide

This README explains how Google Gemini AI is integrated into **FinTrack** to provide built-in financial summaries, spending insights, forecasts, and conversational Q&A—all powered securely via a backend-managed API key without requiring users to enter or configure any keys themselves.

---

## 📦 Libraries Installed

### Backend
- **`@google/genai` (`^3.0.0`)** — Installed in [`backend/package.json`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/package.json).
  - Official modern Google GenAI SDK for Node.js.
  - Uses the **Interactions API** (`ai.interactions.create`) for structured JSON reports and stateful multi-turn follow-up chat (`previous_interaction_id`).

### Frontend
- No additional npm packages were required. The UI builds on existing dependencies (`axios`, `recharts`, `react-router-dom`, `react-icons`, `react-hot-toast`).

---

## 🔐 How Authentication & Secrets Work

- **Backend-managed secret**: The Gemini API key is stored in [`backend/.env`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/.env) as `GEMINI_API_KEY` (never exposed to or entered by users on the frontend).
- **Protected endpoints**: Every `/api/v1/analytics/*` route uses the existing `protect` JWT middleware so users only analyze and query their own transaction data.

---

## 🗂️ Files & Responsibilities

### Backend

| File | Purpose |
|---|---|
| [`backend/controllers/analyticsController.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/controllers/analyticsController.js) | Core analytics & AI engine:<br>• Resolves `date`, `week`, `month`, and `year` ranges (`resolvePeriodRange`).<br>• Computes metrics, category breakdowns, and period-over-period comparisons (`getPeriodAnalytics`, `getMonthlyHistory`).<br>• Calls Gemini AI (`generateAiSummary`) with a strict JSON schema to return `executiveSummary`, `spendingStatus`, `keyInsights`, `categoryAnalysis`, `savingTips`, and `nextPeriodForecast`.<br>• Powers multi-turn Q&A (`askAiAssistant`) using `previous_interaction_id` for context.<br>• Implements automatic model fallback (`createAiInteractionWithFallback`): tries `gemini-3.8-flash` first and falls back to `gemini-3.5-flash-lite` and `gemini-3.1-flash-lite` if the primary model experiences transient `503` high demand. |
| [`backend/models/periodSummary.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/models/periodSummary.js) | Mongoose `PeriodSummary` model that caches computed financial metrics and persists generated `aiSummary` reports and `interactionId` per user and period. |
| [`backend/routes/analyticsRoutes.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/routes/analyticsRoutes.js) | Defines JWT-protected Express routes:<br>• `GET /period`<br>• `GET /monthly-history`<br>• `POST /ai-summary`<br>• `POST /ai-chat` |
| [`backend/server.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/server.js) | Mounts analytics routes at `/api/v1/analytics`. |
| [`backend/models/expenses.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/models/expenses.js) & [`backend/models/income.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/models/income.js) | Added `year`, `month`, and `monthKey` fields with `pre("save")` hooks and MongoDB indexes (`{ userId, date }`, `{ userId, monthKey }`) for fast period queries. |
| [`backend/controllers/expenseControllers.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/controllers/expenseControllers.js) & [`backend/controllers/incomeControllers.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/backend/controllers/incomeControllers.js) | Calls `syncMonthlySummaryForDate` when transactions are added or deleted so stored monthly analytics stay up to date automatically. |

### Frontend

| File | Purpose |
|---|---|
| [`frontend/expense-tracker-frontend/src/pages/Dashboard/Insights.jsx`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/pages/Dashboard/Insights.jsx) | Main **AI Insights** page (`/insights`) featuring:<br>• Period selector (`Date`, `Week`, `Month`, `Year`) with prev/next navigation and stored-month shortcuts.<br>• KPI summary cards, income/expense trend bar charts, and category breakdown pie chart.<br>• **AI Summary** card with one-click generation/regeneration saved to MongoDB.<br>• **Ask Gemini** interactive chat panel with quick prompt chips and conversational memory. |
| [`frontend/expense-tracker-frontend/src/pages/Dashboard/Home.jsx`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/pages/Dashboard/Home.jsx) & [`Expense.jsx`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/pages/Dashboard/Expense.jsx) | Quick-access AI Insights banner and button that navigate directly to `/insights` with the currently selected period preloaded. |
| [`frontend/expense-tracker-frontend/src/utils/apiPaths.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/utils/apiPaths.js) | Defines `API_PATHS.ANALYTICS` endpoints (`GET_PERIOD`, `GET_MONTHLY_HISTORY`, `GENERATE_AI_SUMMARY`, `ASK_AI_CHAT`). |
| [`frontend/expense-tracker-frontend/src/utils/axiosInstance.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/utils/axiosInstance.js) | Configures the Axios client with `45000ms` timeout for AI requests and attaches the user's JWT `Authorization` header. |
| [`frontend/expense-tracker-frontend/src/App.jsx`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/App.jsx) & [`src/utils/data.js`](file:///Users/sillymillie/Desktop/Code/projects/expense-tracker/frontend/expense-tracker-frontend/src/utils/data.js) | Registers the `/insights` route and adds **"AI Insights"** to the sidebar navigation (`SIDE_DATA_MENU`). |

---

## 🔄 Request Flow Overview

1. User opens **AI Insights** from the sidebar (or clicks **Analyze with AI** from the Dashboard / Expense page).
2. Frontend calls `GET /api/v1/analytics/period` to load charts, metrics, and any previously saved `aiSummary` from MongoDB.
3. Clicking **Generate AI Summary** sends `POST /api/v1/analytics/ai-summary` with `periodType` and `periodKey`.
4. Backend aggregates the user's income/expense data for that period and the previous period, sends the dataset to Gemini using `process.env.GEMINI_API_KEY`, validates the structured JSON response, saves it in `PeriodSummary`, and returns it to the UI.
5. Asking follow-up questions in **Ask Gemini** calls `POST /api/v1/analytics/ai-chat` along with `previousInteractionId` so Gemini remembers the prior summary or conversation turn.

