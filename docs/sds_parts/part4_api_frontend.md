# SECTION 12: COMPLETE REST API SPECIFICATION

### 12.1 Global API Standards & Conventions
* **Base URL:** `https://api.lifetrackpro.com/api/v1`
* **Transport:** HTTPS only, TLS 1.3 enforced.
* **Content Type:** `application/json` for all request/response bodies unless explicitly designated (e.g., `multipart/form-data` for receipt uploads).
* **Date & Timestamp Format:** ISO 8601 extended format with UTC offset (`YYYY-MM-DDTHH:MM:SS.sssZ`).
* **Authentication Header:** Standard Bearer token authentication:
  ```http
  Authorization: Bearer <RS256_JWT_ACCESS_TOKEN>
  ```
* **Standard Error Envelope:**
  ```json
  {
    "status": "error",
    "code": "VALIDATION_FAILED",
    "message": "The provided transaction payload contains invalid fields.",
    "request_id": "c7a840c9-940f-48fa-86e4-39908d13a69a",
    "errors": [
      {
        "field": "amount_cents",
        "detail": "Must be an integer strictly greater than zero."
      }
    ]
  }
  ```

---

### 12.2 Complete Endpoint Specification Matrix

#### 1. Authentication & Security Endpoints
* **`POST /api/v1/auth/register/`**
  - **Auth:** Public
  - **Body:**
    ```json
    { "email": "sarah@example.com", "password": "SecurePassword123!", "first_name": "Sarah", "last_name": "Chen" }
    ```
  - **Response (201 Created):**
    ```json
    { "status": "success", "user": { "id": "018e38f2-...", "email": "sarah@example.com", "tier": "free" }, "access_token": "eyJhbGciOi...", "expires_in": 900 }
    ```
* **`POST /api/v1/auth/login/`**
  - **Auth:** Public (Rate limited: 5 req/min per IP)
  - **Body:** `{ "email": "sarah@example.com", "password": "SecurePassword123!" }`
  - **Response (200 OK):** Sets `HttpOnly; Secure; SameSite=Strict` cookie with refresh token; returns access token JSON.
* **`POST /api/v1/auth/refresh/`**
  - **Auth:** Refresh Token Cookie
  - **Response (200 OK):** `{ "access_token": "eyJhbGciOi...", "expires_in": 900 }`
* **`POST /api/v1/auth/mfa/setup/`**
  - **Auth:** Bearer Token
  - **Response (200 OK):** `{ "secret": "JBSWY3DPEHPK3PXP", "qr_code_base64": "data:image/png;base64,..." }`
* **`POST /api/v1/auth/mfa/verify/`**
  - **Auth:** Bearer Token
  - **Body:** `{ "code": "492019" }`
  - **Response (200 OK):** `{ "mfa_enabled": true, "recovery_codes": ["A1B2-C3D4", "E5F6-G7H8", "..."] }`

---

#### 2. Financial & Expense Endpoints
* **`GET /api/v1/expenses/`**
  - **Query Params:** `?page=1&page_size=50&start_date=2026-09-01&end_date=2026-09-30&category_id=<uuid>&search=Whole+Foods`
  - **Response (200 OK):**
    ```json
    {
      "count": 142,
      "next": "https://api.lifetrackpro.com/api/v1/expenses/?page=2",
      "previous": null,
      "results": [
        {
          "id": "018e38f2-95b7-789a-bc01-1e9a22334455",
          "category": { "id": "018e38ee-...", "name": "Groceries", "color_hex": "#10B981" },
          "amount_cents": 4520,
          "currency": "USD",
          "amount_base_currency_cents": 4520,
          "merchant_name": "Whole Foods Market",
          "transaction_date": "2026-09-14",
          "payment_method": "credit_card",
          "is_recurring": false,
          "notes": "Weekly produce and almond milk"
        }
      ]
    }
    ```
* **`POST /api/v1/expenses/`**
  - **Auth:** Bearer Token
  - **Body:**
    ```json
    {
      "category_id": "018e38ee-...",
      "amount_cents": 1250,
      "currency": "USD",
      "merchant_name": "Blue Bottle Coffee",
      "transaction_date": "2026-09-15",
      "payment_method": "apple_pay"
    }
    ```
  - **Response (201 Created):** Returns instantiated expense object.
* **`POST /api/v1/expenses/split/`**
  - **Auth:** Bearer Token
  - **Body:**
    ```json
    {
      "merchant_name": "Target",
      "transaction_date": "2026-09-15",
      "total_amount_cents": 10000,
      "splits": [
        { "category_id": "018e38ee-groceries", "amount_cents": 6000 },
        { "category_id": "018e38ee-home", "amount_cents": 4000 }
      ]
    }
    ```
  - **Response (201 Created):** Returns array of split child transactions.

---

#### 3. Budget Management Endpoints
* **`GET /api/v1/budgets/current/`**
  - **Auth:** Bearer Token
  - **Response (200 OK):**
    ```json
    {
      "period": { "start": "2026-09-01", "end": "2026-09-30" },
      "total_budget_cents": 450000,
      "total_spent_cents": 215000,
      "categories": [
        {
          "category_id": "018e38ee-...",
          "name": "Groceries",
          "limit_cents": 80000,
          "spent_cents": 45200,
          "projected_spend_cents": 78400,
          "burn_rate_status": "on_track"
        }
      ]
    }
    ```

---

#### 4. Habit & Streak Endpoints
* **`GET /api/v1/habits/`**
  - **Response (200 OK):** Returns active habits with current streak, target frequency, and today's completion status.
* **`POST /api/v1/habits/{id}/log/`**
  - **Body:** `{ "log_date": "2026-09-15", "logged_value": 1.0, "friction_rating": 2, "notes": "Felt energized" }`
  - **Response (200 OK):** `{ "habit_id": "...", "current_streak": 14, "streak_incremented": true }`
* **`POST /api/v1/habits/{id}/freeze/`**
  - **Response (200 OK):** Redeems a freeze token and preserves streak for designated date.

---

#### 5. Activities & Focus Telemetry Endpoints
* **`POST /api/v1/activities/`**
  - **Body:**
    ```json
    {
      "category_id": "018e38ef-...",
      "name": "Morning Tempo Run",
      "duration_minutes": 45,
      "rpe_score": 7,
      "pre_energy_score": 5,
      "post_energy_score": 8,
      "metric_payload": { "distance_km": 8.2, "avg_pace_min_km": 5.48 },
      "logged_at": "2026-09-15T07:30:00Z"
    }
    ```
  - **Response (201 Created):** Returns logged activity.

---

#### 6. Cross-Domain Analytics & Synergy Endpoints
* **`GET /api/v1/analytics/synergy/`**
  - **Query Params:** `?metric_x=daily_screen_time_hours&metric_y=dining_spend_cents&range_days=90`
  - **Response (200 OK):**
    ```json
    {
      "correlation_coefficient": 0.68,
      "p_value": 0.002,
      "sample_size": 90,
      "interpretation": "Strong positive correlation: High screen time significantly correlates with dining expenditure increases.",
      "data_points": [
        { "date": "2026-06-15", "x": 9.2, "y": 8400 },
        { "date": "2026-06-16", "x": 4.5, "y": 1200 }
      ]
    }
    ```

---

#### 7. Contextual AI & Copilot Endpoints
* **`POST /api/v1/ai/quick-parse/`**
  - **Body:** `{ "raw_text": "Spent $42 on lunch at Sweetgreen and ran 5k in 25 mins" }`
  - **Response (200 OK):**
    ```json
    {
      "parsed_entities": {
        "expenses": [
          { "merchant_name": "Sweetgreen", "amount_cents": 4200, "category_suggestion": "Dining" }
        ],
        "activities": [
          { "name": "5k Run", "duration_minutes": 25, "metric_payload": { "distance_km": 5.0 } }
        ]
      },
      "requires_confirmation": true
    }
    ```

---

# SECTION 13: FRONTEND ARCHITECTURE & DESIGN SYSTEM

### 13.1 Modern React 19 + TypeScript Tech Stack
* **Framework:** React 19 + Vite (Fast HMR & ESM builds).
* **Language:** TypeScript 5.5+ in strict mode (`"strict": true`, `"noImplicitAny": true`).
* **Routing:** React Router v7 with loader data prefetching.
* **Component Primitives:** Radix UI / Shadcn UI + Tailwind CSS v3.4+.
* **State Management:**
  - *Server State:* TanStack React Query v5 (Optimistic updates, garbage collection, window refocus revalidation).
  - *Client Global State:* Zustand (Lightweight stores for theme, active focus timer, sidebar state).
  - *Form Management:* React Hook Form + Zod (Strict TypeScript schema inference).

### 13.2 Directory & Component Tree Architecture
```text
frontend/
├── public/
│   ├── manifest.json
│   └── sw.js                 # Service worker for offline mutation caching
├── src/
│   ├── assets/               # Brand SVGs and sound chimes
│   ├── components/
│   │   ├── ui/               # Shadcn/Vengeance primitives (Button, Card, Dialog, Table)
│   │   ├── layout/           # AppShell, Sidebar, Header, Breadcrumbs, MobileNav
│   │   ├── finance/          # ExpenseTable, SplitDrawer, BudgetProgressCard
│   │   ├── habits/           # HabitGrid, StreakBadge, HabitCalendarHeatmap
│   │   ├── activities/       # PomodoroTimer, ActivityTimeline, ExertionMeter
│   │   ├── goals/            # GoalTree, VelocityPacingChart
│   │   ├── analytics/        # SynergyScatterPlot, RadarOverview
│   │   └── cmdk/             # CommandPalette modal and action registry
│   ├── hooks/
│   │   ├── useExpenses.ts    # React Query queries & mutations for expenses
│   │   ├── useHabits.ts      # Habit queries, streak optimistic updates
│   │   ├── useTimer.ts       # Web Worker backed focus timer
│   │   └── useKeyboard.ts    # Global hotkey listeners (Cmd+K, Cmd+N)
│   ├── stores/
│   │   ├── useUIStore.ts     # Sidebar collapse, theme, active drawer
│   │   └── useTimerStore.ts  # Focus session state persisted to localStorage
│   ├── services/
│   │   ├── api.ts            # Axios / Fetch client with token refresh interceptor
│   │   ├── offlineSync.ts    # IndexedDB queue processor
│   │   └── soundEffects.ts   # Howler.js audio chimes for habit checkoffs
│   ├── types/
│   │   ├── index.ts          # Core domain models (Expense, Habit, Goal)
│   │   └── api.ts            # Paginated response wrappers and error types
│   ├── routes/               # Page components and route definitions
│   ├── App.tsx
│   └── main.tsx
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

### 13.3 Custom Hook Example: Optimistic Habit Completion

```typescript
// src/hooks/useHabits.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Habit, HabitLog } from '@/types';
import { soundEffects } from '@/services/soundEffects';

export function useLogHabit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, logDate, value }: { habitId: string; logDate: string; value: number }) => {
      const response = await api.post(`/api/v1/habits/${habitId}/log/`, {
        log_date: logDate,
        logged_value: value,
      });
      return response.data;
    },
    // Optimistic UI Update
    onMutate: async ({ habitId, logDate, value }) => {
      await queryClient.cancelQueries({ queryKey: ['habits', 'daily', logDate] });
      const previousHabits = queryClient.getQueryData<Habit[]>(['habits', 'daily', logDate]);

      if (previousHabits) {
        queryClient.setQueryData<Habit[]>(['habits', 'daily', logDate], (old) =>
          old?.map((h) =>
            h.id === habitId
              ? { ...h, current_streak: h.current_streak + 1, is_completed_today: true }
              : h
          )
        );
      }

      soundEffects.playCheckChime();
      return { previousHabits };
    },
    onError: (err, newLog, context) => {
      if (context?.previousHabits) {
        queryClient.setQueryData(['habits', 'daily', newLog.logDate], context.previousHabits);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

### 13.4 Offline Mutation Sync Engine (IndexedDB)
When `navigator.onLine === false`, API calls are queued in an IndexedDB store called `offline_mutations`. When the browser fires the `online` event, the queue processor reads pending entries and dispatches them sequentially with an `X-Idempotency-Key` header matching the client-generated mutation UUID, preventing duplicate entries on flaky mobile connections.
