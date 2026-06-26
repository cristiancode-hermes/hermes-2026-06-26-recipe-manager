import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { Ingredient } from '../../models/recipe.model';

interface IngredientRow {
  name: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back -->
      <a routerLink="/recipes" class="inline-flex items-center gap-1 text-surface-500 hover:text-primary-500 transition-colors mb-6 text-sm">
        ← Back to Recipes
      </a>

      <h1 class="font-display text-3xl font-bold text-surface-800 dark:text-surface-100 mb-8">
        {{ isEditing() ? '✏️ Edit Recipe' : '➕ New Recipe' }}
      </h1>

      <form (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Title *</label>
          <input
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., Grandma's Apple Pie"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Description *</label>
          <textarea
            [(ngModel)]="description"
            name="description"
            rows="3"
            required
            class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="A short description of the recipe"
          ></textarea>
        </div>

        <!-- Row: prep, cook, servings, difficulty -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Prep Time (min) *</label>
            <input
              type="number"
              [(ngModel)]="prepTime"
              name="prepTime"
              required
              min="0"
              class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cook Time (min) *</label>
            <input
              type="number"
              [(ngModel)]="cookTime"
              name="cookTime"
              required
              min="0"
              class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Servings *</label>
            <input
              type="number"
              [(ngModel)]="servings"
              name="servings"
              required
              min="1"
              class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Difficulty *</label>
            <select
              [(ngModel)]="difficulty"
              name="difficulty"
              required
              class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>
        </div>

        <!-- Ingredients -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300">Ingredients *</label>
            <button type="button" (click)="addIngredient()" class="text-sm text-primary-500 hover:text-primary-600 font-medium">
              + Add Ingredient
            </button>
          </div>
          <div class="space-y-2">
            @for (ing of ingredients(); track $index) {
              <div class="flex gap-2 items-start">
                <input
                  type="text"
                  [(ngModel)]="ing.name"
                  [name]="'ing_name_' + $index"
                  placeholder="Ingredient name"
                  class="flex-1 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  [(ngModel)]="ing.quantity"
                  [name]="'ing_qty_' + $index"
                  placeholder="Qty"
                  step="0.25"
                  min="0"
                  class="w-20 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  [(ngModel)]="ing.unit"
                  [name]="'ing_unit_' + $index"
                  class="w-24 px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pcs">pcs</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tbsp</option>
                  <option value="tsp">tsp</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="clove">clove</option>
                  <option value="to taste">to taste</option>
                </select>
                <button type="button" (click)="removeIngredient($index)" class="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" aria-label="Remove ingredient">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            }
          </div>
          @if (ingredients().length === 0) {
            <p class="text-sm text-surface-400 mt-2">Click "+ Add Ingredient" to add ingredients.</p>
          }
        </div>

        <!-- Instructions -->
        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Instructions *</label>
          <p class="text-xs text-surface-400 mb-2">One step per line</p>
          <textarea
            [(ngModel)]="instructionsText"
            name="instructions"
            rows="8"
            required
            class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder="Preheat oven to 350°F&#10;Mix flour and sugar&#10;Bake for 30 minutes"
          ></textarea>
        </div>

        <!-- Submit -->
        <div class="flex gap-3 pt-4">
          <button
            type="submit"
            [disabled]="submitting()"
            class="px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            @if (submitting()) {
              Saving...
            } @else {
              {{ isEditing() ? 'Update Recipe' : 'Create Recipe' }}
            }
          </button>
          <a routerLink="/recipes" class="px-6 py-2.5 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Cancel
          </a>
        </div>

        @if (submitError()) {
          <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {{ submitError() }}
          </div>
        }
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RecipeFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private recipeService = inject(RecipeService);

  protected readonly isEditing = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly prepTime = signal(30);
  protected readonly cookTime = signal(30);
  protected readonly difficulty = signal<'easy' | 'medium' | 'hard'>('medium');
  protected readonly servings = signal(4);
  protected readonly ingredients = signal<IngredientRow[]>([]);
  protected readonly instructionsText = signal('');

  private editId: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId = id;
      this.isEditing.set(true);
      this.loadRecipe(id);
    }
  }

  private async loadRecipe(id: string): Promise<void> {
    const recipe = await this.recipeService.fetchOne(id);
    if (recipe) {
      this.title.set(recipe.title);
      this.description.set(recipe.description);
      this.prepTime.set(recipe.prepTime);
      this.cookTime.set(recipe.cookTime);
      this.difficulty.set(recipe.difficulty);
      this.servings.set(recipe.servings);
      this.ingredients.set(recipe.ingredients.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
      })));
      this.instructionsText.set(recipe.instructions.join('\n'));
    }
  }

  addIngredient(): void {
    this.ingredients.update(list => [...list, { name: '', quantity: 1, unit: 'pcs' }]);
  }

  removeIngredient(index: number): void {
    this.ingredients.update(list => list.filter((_, i) => i !== index));
  }

  async onSubmit(): Promise<void> {
    this.submitting.set(true);
    this.submitError.set(null);

    const data = { title: this.title(), description: this.description(), prepTime: this.prepTime(), cookTime: this.cookTime(), difficulty: this.difficulty(), servings: this.servings() };
    const instructions = this.instructionsText()
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const ingredients: Ingredient[] = this.ingredients()
      .filter(i => i.name.trim().length > 0)
      .map(i => ({
        name: i.name.trim(),
        quantity: i.quantity || 0,
        unit: i.unit,
      }));

    if (!data.title || !data.description || ingredients.length === 0 || instructions.length === 0) {
      this.submitError.set('Please fill in all required fields.');
      this.submitting.set(false);
      return;
    }

    const payload = {
      title: data.title,
      description: data.description,
      prepTime: data.prepTime,
      cookTime: data.cookTime,
      difficulty: data.difficulty,
      servings: data.servings,
      ingredients,
      instructions,
    };

    try {
      if (this.editId) {
        await this.recipeService.update(this.editId, payload);
      } else {
        await this.recipeService.create(payload);
      }
      this.router.navigate(['/recipes']);
    } catch (err: any) {
      this.submitError.set(err?.message ?? 'Failed to save recipe');
    } finally {
      this.submitting.set(false);
    }
  }
}
