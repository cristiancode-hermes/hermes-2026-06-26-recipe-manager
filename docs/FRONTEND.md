# Frontend Architecture

## Signal Architecture

### State Management Pattern

All state is managed through Angular 22 signals:

```typescript
// Service state (shared across components)
export class RecipeService {
  readonly recipes = signal<Recipe[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async fetchAll(filters?: RecipeFilters): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.http.get<Recipe[]>('/api/recipes', { params: filters });
      this.recipes.set(data);
    } catch (e) {
      this.error.set(e?.message ?? 'Failed to load recipes');
    } finally {
      this.loading.set(false);
    }
  }
}

// Component derived state via computed
export class RecipeListComponent {
  readonly filteredRecipes = computed(() => {
    let recipes = [...this.recipeService.recipes()];
    // Apply search, difficulty, sort filters...
    return recipes;
  });
}
```

### Component State Categories

| Category | Pattern | Example |
|----------|---------|---------|
| Server data | Service manages `signal<T[]>()`, components read it | `recipes`, `mealPlans` |
| Loading/error | `signal<boolean>`, `signal<string|null>` per data source | `loading()`, `error()` |
| UI state | `signal<T>()` in component | `searchQuery`, `difficultyFilter`, `sortBy` |
| Derived | `computed<T>()` | `filteredRecipes`, `groupedItems` |
| Component I/O | `input<T>()`, `output<T>()`, `model<T>()` | `[recipe]`, `(saved)` |

## Lazy Routes

```typescript
export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
  { path: 'recipes', loadComponent: () => import('./pages/recipe-list/recipe-list').then(m => m.RecipeListComponent) },
  { path: 'recipes/new', loadComponent: () => import('./pages/recipe-form/recipe-form').then(m => m.RecipeFormComponent) },
  { path: 'recipes/:id', loadComponent: () => import('./pages/recipe-detail/recipe-detail').then(m => m.RecipeDetailComponent) },
  { path: 'recipes/:id/edit', loadComponent: () => import('./pages/recipe-form/recipe-form').then(m => m.RecipeFormComponent) },
  { path: 'meal-planner', loadComponent: () => import('./pages/meal-planner/meal-planner').then(m => m.MealPlannerComponent) },
  { path: 'shopping-list', loadComponent: () => import('./pages/shopping-list/shopping-list').then(m => m.ShoppingListComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/auth').then(m => m.AuthComponent) },
];
```

## Shared Components

| Component | Inputs | Purpose |
|-----------|--------|---------|
| `HeaderComponent` | none (uses auth service) | Navigation, auth status, dark mode toggle |
| `RecipeCardComponent` | `recipe: Recipe` | Recipe grid card with emoji, difficulty, timing |
| `DifficultyBadgeComponent` | `difficulty: string` | Colored badge (easy=🟢, medium=🟡, hard=🔴) |
| `LoadingSkeletonComponent` | none | Animated skeleton placeholders |
| `EmptyStateComponent` | `icon`, `title`, `message` | Empty state with emoji + action |
| `ConfirmDialogComponent` | `title`, `message`, `(confirm)` | Simple confirmation modal |

## Zoneless Change Detection

```typescript
// app.config.ts
import { provideZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
```

Without Zone.js, change detection is triggered by:
1. Signal value changes (signals are the primary trigger)
2. Async operations (fetch, setTimeout)
3. Event handlers (click, input)
4. `ChangeDetectorRef.markForCheck()` calls

## Tailwind Design System

Defined in `styles.css` via `@theme`:

```css
@theme {
  --color-primary-500: #ec7a12;   /* Warm orange - primary actions */
  --color-primary-600: #dd5f0a;   /* Darker orange - hover */
  --color-secondary-500: #22c55e; /* Green - success/shopping list progress */
  --color-surface-100: #f5f5f4;   /* Light gray - backgrounds */
  --color-surface-800: #292524;   /* Dark gray - dark mode surfaces */
  --font-display: "Playfair Display", Georgia, serif;
}
```
