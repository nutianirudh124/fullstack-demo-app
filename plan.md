# Expense Manager - Full Stack App Plan

## Data Analysis (Dinero.csv)

The CSV tracks February expenses with the following structure:
- **Fields**: date, category (Needs/Wants), sub_category (Transport, Food & Drinks, Sports, Accessories, Clothing, Monthly Payments, Misc), description, amount, running_total, running_balance, is_recurring
- **Summary**: Total spent: Rs.13,386.99 | Remaining balance: Rs.20,003.72
- **Budget**: Implied monthly cap of ~Rs.33,390

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.14, FastAPI, SQLAlchemy (ORM) |
| Database | SQLite |
| Frontend | React 18 + TypeScript, Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| HTTP Client | Axios |
| Package Manager | uv (Python), npm (JS) |

## Project Structure

```
fullstack_demo_app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry + CORS
│   │   ├── database.py          # SQLite + SQLAlchemy setup
│   │   ├── models.py            # SQLAlchemy DB models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── repository.py        # Repository pattern - DB access layer
│   │   ├── routers/
│   │   │   └── expenses.py      # CRUD + summary endpoints
│   │   └── seed.py              # CSV importer script
│   └── expenses.db
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx     # Summary cards + charts
│   │   │   ├── ExpenseTable.tsx  # Filterable/sortable expense list
│   │   │   ├── ExpenseForm.tsx   # Add/edit expense modal
│   │   │   └── Charts.tsx        # Pie + bar chart components
│   │   ├── api/
│   │   │   └── expenses.ts      # Axios API client
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── App.tsx
│   └── vite.config.ts
├── Dinero.csv
└── plan.md
```

## Backend API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /api/expenses | List all expenses (query filters: category, sub_category, date) |
| POST | /api/expenses | Create a new expense |
| PUT | /api/expenses/{id} | Update an expense |
| DELETE | /api/expenses/{id} | Delete an expense |
| GET | /api/expenses/summary | Aggregated totals: by category, sub_category, and overall |
| POST | /api/expenses/seed | Import data from Dinero.csv |

## Database Schema

**expenses** table:
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| date | DATE | Expense date |
| category | VARCHAR | "Needs" or "Wants" |
| sub_category | VARCHAR | Transport, Food & Drinks, etc. |
| description | VARCHAR | What the expense was for |
| amount | FLOAT | Amount in rupees (negative for refunds) |
| is_recurring | BOOLEAN | Whether this is a recurring expense |

## Frontend Views

1. **Dashboard** - Summary cards (total spent, balance, Needs vs Wants) + pie chart (by sub-category) + bar chart (spending by date)
2. **Expense Table** - Sortable, filterable list with inline delete and edit actions
3. **Add/Edit Modal** - Form to create or update expense entries

## GoF Design Patterns

- **Repository Pattern** - `ExpenseRepository` abstracts all DB queries, keeping route handlers clean
- **Factory Pattern** - CSV row parsing uses a factory method to create expense objects
- **Strategy Pattern** - Pluggable sort/filter strategies on the list endpoint

## Implementation Order

1. Backend: database setup + models + seed script (import CSV)
2. Backend: repository layer + FastAPI routes
3. Frontend: Vite + React + Tailwind scaffold
4. Frontend: API client + Dashboard with charts
5. Frontend: Expense table with CRUD operations
6. Integration testing and polish
