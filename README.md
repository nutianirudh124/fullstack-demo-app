# Expense Manager - Demo App

A full-stack expense tracking app with a FastAPI backend and React frontend.

## Stack

**Backend:** Python 3.14, FastAPI, SQLAlchemy, SQLite, uvicorn
**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Axios

## Project Structure

```
backend/app/    # FastAPI app (models, schemas, repository, routers)
frontend/src/   # React app
```

## Getting Started

### Backend

```bash
uv sync
uvicorn backend.app.main:app --reload
```

API runs at `http://localhost:8000`. Swagger docs at `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:5173`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/expenses` | List expenses (filter by category, sub_category, date range) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/summary` | Spending summary |
| POST | `/api/expenses/seed` | Seed sample data |

## Data Model

Each expense has: `date`, `category`, `sub_category`, `description`, `amount`, `is_recurring`.
