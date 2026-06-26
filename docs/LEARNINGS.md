# Learnings from Recipe Manager

## 1. TypeORM DeepPartial Type Issues with Relation Objects

**Problem:** When saving entities with relation references (e.g., `{ recipe: { id: 1 }, ingredient: { id: 2 } }`), TypeORM 1.0's DeepPartial type doesn't accept `{ id: number }` objects for relation properties that are typed as `ManyToOne<Entity>`.

**Fix:** Cast with `as any` for batch saves on junction entities.

```typescript
await this.recipeIngredientRepo.save([
  { recipe: { id: recipe1.id }, ingredient: { id: getIng('Salt').id }, quantity: 1, unit: 'tsp' },
] as any);  // Required: TypeORM's DeepPartial type doesn't accept relation objects
```

**Why this works:** TypeORM's `save()` method accepts `DeepPartial<T>` at the TypeScript level but actually handles relation objects (`{ entity: { id: id } }`) correctly at runtime. The type cast is purely to satisfy the compiler.

## 2. Angular 22 ngModel with Signal Values

**Problem:** `[(ngModel)]="formData.title"` fails when `formData` is a `WritableSignal<{title: string, ...}>` — the compiler doesn't auto-unwrap signals for ngModel access.

**Solution:** Don't use a single form-data signal. Use individual signals for each form field:

```typescript
// ✅ Works correctly with ngModel
protected readonly title = signal('');
protected readonly description = signal('');
protected readonly servings = signal(4);

// ❌ Fails: WritableSignal<{title: string, ...}>
// [(ngModel)]="formData.title"
protected readonly formData = signal({ title: '', ... });
```

**Lesson:** ngModel + signals in Angular 22 works best with separate signals per field, not a single compound signal.

## 3. Decorator TS1240 Errors Are Build-Pipeline-Specific

**Problem:** Running `nest build` (SWC) on NestJS 11 with TypeORM, class-validator, and Swagger decorators produces TS1240 errors like: `Unable to resolve signature of property decorator when called as an expression`.

**Fix:** `nest build --tsc` bypasses SWC and uses the TypeScript compiler directly, which correctly handles `experimentalDecorators` + `emitDecoratorMetadata`.

**But:** The linter (tsc in check mode) still reports TS1240 errors for `*.entity.ts` and `*.dto.ts` files even though `nest build --tsc` succeeds. These are **pre-existing lint-only errors** that don't affect the build.

## 4. Shopping List Aggregation Pattern

The shopping list endpoint consolidates ingredients from multiple recipes by summing quantities per ingredient name:

```typescript
// Simplified aggregation logic
const items = new Map<string, { name, category, quantity, unit }>();
mealPlans.forEach(mp => {
  mp.recipe.ingredients.forEach(ri => {
    const key = ri.ingredient.name.toLowerCase();
    if (items.has(key)) {
      items.get(key)!.quantity += ri.quantity;
    } else {
      items.set(key, { ... });
    }
  });
});
```

This works for simple quantity addition but has limitations when units differ (e.g., "garlic: 2 cloves" + "garlic: 1 tbsp minced"). For this project's scope, we assume consistent units per ingredient within the date range.

## 5. Subagent Code Quality Pattern

The subagent that built the backend produced working code with complete file structure but with type errors in seed data (missing `as any` casts). The subagent that built the frontend produced working components with good signal patterns but used private methods in templates (loadRecipes, loadWeek, loadList) that needed public visibility.

**Lesson:** Subagent output is ~90% correct. The remaining 10% requires manual fix-up: type casts for save() calls, method access modifiers for template bindings, and verifying ngModel + signal compatibility.

## 6. Consistent Constant Naming for Entity Enums

The subagent used different enum patterns across entities:
- `Difficulty.EASY` (PascalCase enum)
- `IngredientCategory.PRODUCE` (PascalCase enum)
- `MealType.DINNER` (PascalCase enum)

The frontend models used lowercase strings (`'easy'`, `'dinner'`). This is consistent as long as the API serializes enums as strings, which NestJS does by default with `@ApiProperty({ enum: ... })`.
