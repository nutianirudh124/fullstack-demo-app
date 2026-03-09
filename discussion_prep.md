# Discussion Prep: Full Stack App Development

---

## 1. Design Patterns — Gang of Four (GoF)

### What are design patterns from first principles?

Design patterns are **reusable solutions to commonly occurring problems** in software design. They aren't code you copy-paste — they're templates for *how* to structure your code to solve a specific type of problem.

In 1994, four authors (Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides — the "Gang of Four") published *Design Patterns: Elements of Reusable Object-Oriented Software*, cataloguing 23 patterns in three categories:

| Category | Purpose | Examples |
|---|---|---|
| **Creational** | How objects are created | Factory, Singleton, Builder |
| **Structural** | How objects are composed together | Adapter, Decorator, Facade |
| **Behavioral** | How objects communicate and share responsibility | Strategy, Observer, Iterator |

### Patterns used in our Expense Manager app:

#### a) Repository Pattern (Structural/Behavioral)

**The problem:** Your API route handlers directly contain SQL queries. If you change your database, you rewrite every route. Business logic and data access are tangled together.

**The solution:** Create an intermediary class that *owns* all database operations. Routes only talk to the repository, never directly to the database.

**In our app — `backend/app/repository.py`:**
```python
class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, category=None, ...):
        query = self.db.query(Expense)
        if category:
            query = query.filter(Expense.category == category)
        return query.all()

    def create(self, data: ExpenseCreate):
        expense = Expense(**data.model_dump())
        self.db.add(expense)
        ...
```

**Why it matters:** The route handler in `routers/expenses.py` just calls `repo.get_all()` — it doesn't know or care whether the data comes from SQLite, PostgreSQL, or a file. This is called **separation of concerns**.

#### b) Factory Pattern (Creational)

**The problem:** Creating objects from external data (like a CSV) involves complex parsing, validation, and transformation. If this logic lives everywhere, it's fragile and duplicated.

**The solution:** Centralize object creation in one place — a "factory" — that handles the messy details of constructing valid objects.

**In our app — `backend/app/seed.py`:**
```python
def parse_amount(raw: str) -> float | None:
    cleaned = raw.replace("₹", "").replace(",", "").strip()
    return float(cleaned)

# The seed function acts as a factory: takes raw CSV rows,
# handles all parsing (dates, amounts, booleans), and produces
# valid Expense objects
expense = Expense(
    date=current_date,
    category=category.strip(),
    amount=parse_amount(amount_str),
    is_recurring=is_recurring_str.strip().lower() == "yes",
)
```

**Why it matters:** The CSV has messy data — rupee symbols, comma-separated numbers, "Yes"/"No" strings, dates without years. The factory logic handles all of that in one place.

#### c) Strategy Pattern (Behavioral)

**The problem:** You need to filter/sort data, but the criteria change at runtime based on user input. Hard-coding every combination leads to an explosion of if/else branches.

**The solution:** Make the filtering/sorting behavior *pluggable* — pass in the strategy as a parameter.

**In our app — `routers/expenses.py`:**
```python
@router.get("")
def list_expenses(
    category: str | None = None,       # filter strategy 1
    sub_category: str | None = None,   # filter strategy 2
    start_date: date | None = None,    # filter strategy 3
    end_date: date | None = None,      # filter strategy 4
    repo: ExpenseRepository = Depends(get_repo),
):
    return repo.get_all(category, sub_category, start_date, end_date)
```

The repository's `get_all` method dynamically builds the query based on which filters are provided. Each filter is essentially a strategy that gets composed at runtime.

---

## 2. Backend Development — REST API with FastAPI

### What is a REST API from first principles?

**REST** (Representational State Transfer) is an architectural style for building APIs. The core idea:

- **Resources** — Everything is a resource identified by a URL (e.g., `/api/expenses`)
- **HTTP Methods** — The action you want to perform uses standard HTTP verbs:
  - `GET` = Read
  - `POST` = Create
  - `PUT` = Update (full replacement)
  - `PATCH` = Update (partial)
  - `DELETE` = Remove
- **Stateless** — Every request contains all the information needed. The server doesn't remember previous requests.
- **Uniform Interface** — Consistent URL patterns, status codes, and response formats

### What is FastAPI?

FastAPI is a modern Python web framework built on:
- **Starlette** (async web framework) for HTTP handling
- **Pydantic** (data validation) for request/response schemas
- **Python type hints** as the source of truth for validation, serialization, and documentation

### How we used it in our app:

#### Route definition (`routers/expenses.py`):
```python
@router.get("", response_model=list[ExpenseResponse])
def list_expenses(
    category: str | None = None,   # query param: /api/expenses?category=Needs
    repo: ExpenseRepository = Depends(get_repo),
):
    return repo.get_all(category)
```

Key concepts demonstrated:
- **Path operations** — `@router.get("")`, `@router.post("")`, `@router.put("/{expense_id}")`
- **Query parameters** — Automatic parsing from URL (`?category=Needs`)
- **Path parameters** — `expense_id` extracted from `/api/expenses/5`
- **Dependency injection** — `Depends(get_repo)` injects a repository with a DB session
- **Response models** — `response_model=list[ExpenseResponse]` auto-serializes and validates output
- **Status codes** — `status_code=201` for creation, `204` for deletion, `404` for not found

#### Data validation with Pydantic (`schemas.py`):
```python
class ExpenseCreate(BaseModel):
    date: date
    category: str
    sub_category: str
    description: str
    amount: float
    is_recurring: bool = False
```
If someone sends `{"amount": "not_a_number"}`, FastAPI automatically returns a 422 error with a clear message. No manual validation code needed.

#### Dependency Injection (`database.py`):
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
This is a **generator-based dependency**. FastAPI calls `next()` to get the DB session, runs the route handler, then completes the generator to close the session. This ensures connections are always properly cleaned up — even if the handler raises an exception.

#### CORS Middleware (`main.py`):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend origin
)
```
Browsers block cross-origin requests by default (security). Our frontend (port 5173) talks to our backend (port 8000) — different origins. CORS headers tell the browser "this is allowed."

---

## 3. Frontend Development — General Principles and Practices

### Core principles demonstrated:

#### a) Component-Based Architecture
Instead of building one monolithic page, we break the UI into **self-contained, reusable components**:

```
App.tsx                    — Shell: header + tab navigation
├── Dashboard.tsx          — Summary cards + charts
│   └── Charts.tsx         — Pie chart + bar chart
└── ExpenseTable.tsx       — Filterable list
    └── ExpenseForm.tsx    — Add/edit form
```

**Why?** Each component has a single responsibility. `Charts` only knows how to render charts — it doesn't fetch data or manage navigation. This makes code easier to understand, test, and modify.

#### b) Separation of Concerns
- **`api/expenses.ts`** — All HTTP calls live here. Components never call `axios` directly.
- **`types.ts`** — TypeScript interfaces shared across the app.
- **Components** — Only handle rendering and user interaction.

If the API changes (e.g., different URL), you update one file, not every component.

#### c) State Management with React Hooks
```tsx
const [expenses, setExpenses] = useState<Expense[]>([]);   // data
const [filterCategory, setFilterCategory] = useState("");   // UI state
const [editing, setEditing] = useState<Expense | null>(null); // modal state

useEffect(() => { load(); }, [filterCategory]);  // re-fetch when filter changes
```

- **`useState`** — Declares reactive state. When it changes, the component re-renders.
- **`useEffect`** — Side effects (API calls) triggered by dependency changes.
- Data flows **one direction**: parent to child via props. This is React's "unidirectional data flow."

#### d) TypeScript for Type Safety
```typescript
export interface Expense {
  id: number;
  date: string;
  category: string;
  amount: number;
  ...
}
```
The frontend and backend share the same shape of data. If the backend adds a field, TypeScript catches every place in the frontend that needs updating — at compile time, not at runtime in production.

#### e) Modern Tooling
- **Vite** — Build tool. Near-instant hot module replacement (HMR) during development. Uses native ES modules instead of bundling everything on every change.
- **Tailwind CSS** — Utility-first CSS. Instead of writing `.card { border-radius: 12px; padding: 20px; }` in a separate file, you write `className="rounded-xl p-5"` directly on the element. Keeps styles co-located with markup.

#### f) API Proxy (Vite Config)
```typescript
server: {
  proxy: {
    "/api": "http://localhost:8000",
  },
}
```
The frontend makes requests to `/api/expenses` (same origin). Vite intercepts these and forwards them to the backend on port 8000. This avoids CORS issues during development and mirrors how a production reverse proxy (Nginx) would work.

---

## 4. Full Stack Application Development

### How it all connects — the full picture:

```
User Browser (localhost:5173)
    │
    │  GET /api/expenses?category=Needs
    │
    ▼
Vite Dev Server (proxy)
    │
    │  Forwards to localhost:8000
    │
    ▼
FastAPI Backend
    │
    │  Route → Repository → SQLAlchemy ORM
    │
    ▼
SQLite Database (expenses.db)
    │
    │  Returns rows
    │
    ▼
FastAPI serializes via Pydantic → JSON response
    │
    ▼
React component receives JSON → updates state → re-renders UI
```

### Key full-stack concepts:

| Concept | Where in our app |
|---|---|
| **Client-Server separation** | React frontend is fully independent from FastAPI backend — they communicate only via JSON over HTTP |
| **Data flows through layers** | CSV → Seed script → SQLite → SQLAlchemy ORM → Repository → FastAPI route → Pydantic schema → JSON → Axios → React state → DOM |
| **Single source of truth** | Database is the authority. Frontend fetches fresh data after every mutation (create/update/delete) |
| **Schema consistency** | Pydantic models (backend) mirror TypeScript interfaces (frontend) — same field names and types |
| **Separation of concerns** | Database logic, business logic, API layer, and UI layer are all in separate files/modules |

### Architecture decisions and why:

- **SQLite** — Zero-config, file-based database. Perfect for a demo/small app. For production, swap to PostgreSQL by changing one connection string (thanks to the Repository pattern abstracting DB access).
- **FastAPI over Flask/Django** — Automatic validation, automatic OpenAPI docs (visit http://localhost:8000/docs), async-ready, and Python type hints as the API contract.
- **React over plain HTML/JS** — Component model makes complex UIs manageable. State management handles the dynamic filtering, editing, and chart updates.
- **Tailwind over traditional CSS** — No context-switching between files. Rapid prototyping. The utility classes are self-documenting.

---

## Quick Reference: Talking Points

1. **"What design patterns did you use?"** — Repository (data access abstraction), Factory (CSV parsing), Strategy (dynamic filtering). Explain *the problem each solves*, not just the pattern name.

2. **"How does the REST API work?"** — Resources at URLs, HTTP verbs for actions, stateless, JSON in/out. FastAPI adds automatic validation (Pydantic) and dependency injection (DB sessions).

3. **"What frontend principles matter?"** — Component architecture, unidirectional data flow, separation of concerns (API layer vs components vs types), type safety with TypeScript.

4. **"How do frontend and backend connect?"** — Vite proxy in dev, JSON over HTTP, matching schemas on both sides, frontend re-fetches after mutations to stay in sync with the database.
