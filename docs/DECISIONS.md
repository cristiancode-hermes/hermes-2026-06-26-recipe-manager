# Design Decisions (ADR-Style)

## ADR-1: SQLite + TypeORM with Synchronize

**Status:** Accepted
**Context:** No Neon PostgreSQL connection available (NEON_API_KEY invalid for 14 consecutive runs). Need a local database for development and demo.
**Decision:** Use `better-sqlite3` with TypeORM and `synchronize: true` for automatic schema management.
**Consequences:** Fast iteration, no migration files needed in dev. Schema is defined entirely by entity decorators. When migrating to PostgreSQL, switch to `pg` driver and `synchronize: false` with proper migration files.
**Alternatives considered:** Raw SQLite driver (lose TypeORM ORM features), file-based JSON storage (no relations or querying).

## ADR-2: Single-User Focus (No Multi-Tenancy)

**Status:** Accepted
**Context:** Previous project (CRM 2026-06-24) used multi-tenant org-scoping. This project is a personal cookbook — multi-tenancy adds complexity without benefit for the use case.
**Decision:** Simple User-based ownership. Auth required for create/edit/delete operations. Recipe browsing is public.
**Consequences:** Cleaner code, no org-scoping boilerplate. Easy to add multi-user support later via existing User entity.

## ADR-3: Many-to-Many via Junction Entity (RecipeIngredient)

**Status:** Accepted
**Context:** Recipes have ingredients with quantity and unit. A simple many-to-many via `@ManyToMany` doesn't carry the extra data (quantity, unit, notes).
**Decision:** Use a junction entity `RecipeIngredient` with `@ManyToOne` on both sides. This stores `quantity`, `unit`, and `notes` per relationship.
**Consequences:** Richer data model, more verbose queries (`relations: { ingredients: { ingredient: true } }`), but the materialized relationship is essential.

## ADR-4: Instructions as JSON String

**Status:** Accepted
**Context:** Recipes need ordered steps. Storing as a JSON array of strings provides structure (ordering, splitting, display).
**Decision:** Store `instructions` as a `text` column containing a JSON stringified array. Parse on read, stringify on write.
**Consequences:** Simple storage, no separate Step entity. Frontend joins with `\n` for textarea editing and splits to array for API submission.

## ADR-5: Signal-Only Frontend State (No RxJS BehaviorSubjects)

**Status:** Accepted
**Context:** Angular 22 promotes signals as the primary reactivity primitive. Previous projects used signals successfully.
**Decision:** All component state uses `signal()`, `computed()`, `input()`, `output()`. No `@Input/@Output` decorators. No RxJS `BehaviorSubject` for state. HTTP calls use async/await with signal updates.
**Consequences:** Consistent reactivity model, no RxJS learning curve for simple state, easier to reason about. Some edge cases with ngModel + signals (ADR-6).

## ADR-6: Individual Signals for Form Fields

**Status:** Accepted
**Context:** Using a single `WritableSignal<FormData>` object with ngModel causes TypeScript errors in Angular 22 because ngModel needs two-way bindable properties, not signal wrapper access.
**Decision:** Each form field gets its own `signal()` (e.g., `title = signal('')`, `difficulty = signal<'easy'|'medium'|'hard'>('medium')`). On submit, read all signal values into a plain object.
**Consequences:** More signals per component (6 instead of 1), but ngModel works correctly with template expressions, and TypeScript type-checking passes.

## ADR-7: `nest build --tsc` for Decorator Compatibility

**Status:** Accepted
**Context:** NestJS 11 defaults to SWC builder, which doesn't support `emitDecoratorMetadata` needed by TypeORM, class-validator, and Swagger decorators.
**Decision:** Use `nest build --tsc` for all production builds. This forces the TypeScript compiler path with full decorator metadata emission.
**Consequences:** Slower builds (2-5x vs SWC), but correct runtime behavior. Documented in `nest-cli.json` via `"builder": "tsc"`.

## ADR-8: Tailwind CSS v4 with PostCSS

**Status:** Accepted
**Context:** Angular 22 uses Vite/ESBuild. Tailwind CSS v4 uses a new PostCSS plugin (`@tailwindcss/postcss`) instead of the v3 PostCSS plugin. Angular 22 auto-detects PostCSS config.
**Decision:** Use PostCSS approach with `postcss.config.js` in `apps/web/`. All Tailwind configuration via `@theme` block in `styles.css` (no `tailwind.config.js`).
**Consequences:** One additional config file. No `darkMode: 'class'` config — use `@custom-variant dark` in CSS. Full Tailwind v4 feature set available.
