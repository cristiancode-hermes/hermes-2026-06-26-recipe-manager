import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';
import { DifficultyBadgeComponent } from '../../shared/difficulty-badge/difficulty-badge';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DifficultyBadgeComponent, ConfirmDialogComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back link -->
      <a routerLink="/recipes" class="inline-flex items-center gap-1 text-surface-500 hover:text-primary-500 transition-colors mb-6 text-sm">
        ← Back to Recipes
      </a>

      @if (loading()) {
        <div class="animate-pulse space-y-6">
          <div class="h-8 bg-surface-200 dark:bg-surface-700 rounded w-2/3"></div>
          <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/3"></div>
          <div class="h-40 bg-surface-200 dark:bg-surface-700 rounded"></div>
          <div class="space-y-3">
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full"></div>
            <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-5/6"></div>
          </div>
        </div>
      } @else if (error()) {
        <div class="text-center py-16">
          <div class="text-6xl mb-4">😕</div>
          <h2 class="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">Recipe not found</h2>
          <p class="text-surface-500 mb-4">{{ error() }}</p>
          <a routerLink="/recipes" class="text-primary-500 hover:underline">View all recipes</a>
        </div>
      } @else if (recipe()) {
        @let r = recipe()!;

        <!-- Header -->
        <div class="mb-8">
          <h1 class="font-display text-3xl md:text-4xl font-bold text-surface-800 dark:text-surface-100 mb-4">{{ r.title }}</h1>

          <div class="flex flex-wrap items-center gap-4 mb-4">
            <app-difficulty-badge [difficulty]="r.difficulty" />
            <span class="flex items-center gap-1 text-surface-500 text-sm">⏱ Prep: {{ r.prepTime }} min</span>
            <span class="flex items-center gap-1 text-surface-500 text-sm">🍳 Cook: {{ r.cookTime }} min</span>
            <span class="flex items-center gap-1 text-surface-500 text-sm">👤 Serves: {{ r.servings }}</span>
          </div>

          <p class="text-surface-600 dark:text-surface-400 text-lg">{{ r.description }}</p>
        </div>

        <!-- Ingredients -->
        <div class="mb-8">
          <h2 class="font-display text-2xl font-semibold text-surface-800 dark:text-surface-100 mb-4">🧂 Ingredients</h2>
          <div class="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-6 border border-surface-200 dark:border-surface-700">
            <ul class="space-y-2">
              @for (ing of r.ingredients; track $index) {
                <li class="flex items-center gap-3 text-surface-700 dark:text-surface-300">
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  <span class="font-medium">{{ ing.quantity }} {{ ing.unit }}</span>
                  <span>{{ ing.name }}</span>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mb-8">
          <h2 class="font-display text-2xl font-semibold text-surface-800 dark:text-surface-100 mb-4">📝 Instructions</h2>
          <div class="space-y-4">
            @for (step of r.instructions; track $index) {
              <div class="flex gap-4 bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                  {{ $index + 1 }}
                </span>
                <p class="text-surface-700 dark:text-surface-300 pt-1">{{ step }}</p>
              </div>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          @if (auth.isAuthenticated()) {
            <a [routerLink]="['/recipes', r.id, 'edit']" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
              ✏️ Edit Recipe
            </a>
            <button (click)="showDeleteDialog.set(true)" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
              🗑️ Delete Recipe
            </button>
            <button (click)="openMealPlanner()" class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm">
              📅 Add to Meal Plan
            </button>
          }
        </div>
      }

      <!-- Delete Confirm Dialog -->
      <app-confirm-dialog
        [visible]="showDeleteDialog()"
        title="Delete Recipe"
        message="Are you sure you want to delete this recipe? This cannot be undone."
        icon="🗑️"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        (confirmed)="deleteRecipe()"
        (cancelled)="showDeleteDialog.set(false)"
      />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RecipeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  protected recipeService = inject(RecipeService);
  protected auth = inject(AuthService);

  protected readonly showDeleteDialog = signal(false);

  protected readonly recipe = this.recipeService.currentRecipe;
  protected readonly loading = this.recipeService.loading;
  protected readonly error = this.recipeService.error;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.fetchOne(id);
    }
  }

  async deleteRecipe(): Promise<void> {
    this.showDeleteDialog.set(false);
    const recipe = this.recipe();
    if (recipe?.id) {
      await this.recipeService.delete(recipe.id);
      window.location.href = '/recipes';
    }
  }

  openMealPlanner(): void {
    window.location.href = '/meal-planner';
  }
}
