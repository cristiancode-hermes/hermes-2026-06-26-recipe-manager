# Recipe Manager 🍳 — Personal Cookbook

A full-stack personal recipe manager for cooking enthusiasts. Organize your recipes, plan weekly meals, and generate shopping lists automatically.

**Stack:** Angular 22 (signals, zoneless) · NestJS 11 · TypeORM + SQLite · Tailwind CSS v4

---

## Features

- **📖 Recipe Management** — Create, edit, browse, and search recipes with ingredients, step-by-step instructions, difficulty ratings, and timing breakdowns
- **🥗 Ingredient Catalog** — Reusable ingredient database with categories (produce, dairy, meat, pantry, spices, grains)
- **📅 Meal Planner** — Weekly calendar grid with 4 meal slots per day (breakfast, lunch, dinner, snack). Navigate between weeks, add/remove meals
- **🛒 Shopping List** — Auto-generated from meal plans. Quantities consolidated per ingredient, grouped by category, with check-off progress tracking
- **🔐 User Authentication** — JWT-based register/login with password hashing
- **🌙 Dark Mode** — Full dark mode support with localStorage persistence
- **📱 Responsive Design** — Mobile-first, adaptive grid layout

## Architecture

```
2026-06-26-recipe-manager/
├── apps/
│   ├── api/          # NestJS 11 backend
│   └── web/          # Angular 22 frontend
├── docs/             # Documentation
├── .gitignore
├── .env.example
└── README.md
```

### Backend (NestJS 11)
- **Auth Module** — JWT-based authentication with Passport.js + bcryptjs
- **Recipes Module** — Full CRUD with search, difficulty filtering, category support, sorting
- **Ingredients Module** — Reusable ingredient catalog
- **Meal Plans Module** — Date-range querying, weekly meal assignment
- **Shopping List Module** — Aggregates ingredients from meal plans, consolidates quantities, groups by category
- **Seed Module** — Idempotent database seeding with demo user, 4 recipes, 21 ingredients, and 3 meal plans

### Frontend (Angular 22)
- **Signal-first** — All state managed via `signal()`, `computed()`, `input()`, `output()`. No `@Input`/`@Output` decorators
- **Zoneless** — `provideZonelessChangeDetection()` for simplified change detection
- **Tailwind CSS v4** — PostCSS-based with custom `@theme` tokens (warm orange primary, green secondary)
- **7 Lazy-Loaded Pages** — Home, Recipe List, Recipe Detail, Recipe Form (create/edit), Meal Planner, Shopping List, Auth (login/register)
- **6 Shared Components** — Header, RecipeCard, DifficultyBadge, LoadingSkeleton, EmptyState, ConfirmDialog

## Prerequisites

- Node.js 22+
- npm 10+

## Setup

```bash
# 1. Clone and install dependencies
cd apps/api && npm install
cd ../web && npm install
cd ../..

# 2. Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env if needed

# 3. Build the backend
cd apps/api && node_modules/.bin/nest build --tsc && cd ../..

# 4. Build the frontend
cd apps/web && node_modules/.bin/ng build && cd ../..

# 5. Run the backend (starts on port 3000, seeds database automatically)
cd apps/api && node dist/main.js
```

The API will be available at `http://localhost:3000/api` with Swagger docs at `http://localhost:3000/api/docs`.

### Demo Credentials
- **Email:** demo@cookbook.local
- **Password:** password123

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/recipes` | No | List recipes (search, filter) |
| GET | `/api/recipes/:id` | No | Get recipe detail |
| POST | `/api/recipes` | Yes | Create recipe |
| PATCH | `/api/recipes/:id` | Yes | Update recipe |
| DELETE | `/api/recipes/:id` | Yes | Delete recipe |
| GET | `/api/ingredients` | No | List all ingredients |
| POST | `/api/ingredients` | Yes | Create ingredient |
| GET | `/api/meal-plans` | No | List meal plans by date range |
| POST | `/api/meal-plans` | Yes | Add meal to plan |
| DELETE | `/api/meal-plans/:id` | Yes | Remove meal from plan |
| GET | `/api/shopping-list` | No | Generate shopping list for date range |

## Testing

```bash
cd apps/api
node_modules/.bin/jest
```

## Roadmap

- [ ] Neon PostgreSQL migration (currently SQLite)
- [ ] Recipe image upload
- [ ] Import/export recipes (JSON format)
- [ ] Nutritional information calculator
- [ ] Grocery store integration
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] i18n support
