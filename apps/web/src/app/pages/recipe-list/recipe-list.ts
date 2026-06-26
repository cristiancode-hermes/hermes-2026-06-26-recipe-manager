import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [RouterLink, FormsModule, RecipeCardComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 class="font-display text-3xl font-bold text-surface-800 dark:text-surface-100">Recipes</h1>
        <a routerLink="/recipes/new" class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
          + New Recipe
        </a>
      </div>

      <!-- Search + Filters -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="flex-1 relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">🔍</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearch()"
            placeholder="Search recipes..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        <div class="flex gap-2">
          @for (level of ['all', 'easy', 'medium', 'hard']; track level) {
            <button
              (click)="setDifficulty(level)"
              [class]="difficultyFilter() === level
                ? 'px-4 py-2 rounded-lg text-sm font-medium bg-primary-500 text-white'
                : 'px-4 py-2 rounded-lg text-sm font-medium border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors'"
            >
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </button>
          }
        </div>
        <select
          [(ngModel)]="sortBy"
          (change)="onSort()"
          class="px-3 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="name">Sort by Name</option>
          <option value="prepTime">Sort by Prep Time</option>
        </select>
      </div>

      <!-- Content -->
      @if (recipeService.loading()) {
        <app-loading-skeleton />
      } @else if (recipeService.error()) {
        <div class="text-center py-16">
          <p class="text-red-500">{{ recipeService.error() }}</p>
          <button (click)="loadRecipes()" class="mt-2 text-primary-500 hover:underline">Try again</button>
        </div>
      } @else if (filteredRecipes().length === 0) {
        <app-empty-state
          icon="🔍"
          title="No recipes found"
          message="Try adjusting your search or filters."
        />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          @for (recipe of filteredRecipes(); track recipe.id) {
            <app-recipe-card [recipe]="recipe" />
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class RecipeListComponent implements OnInit {
  protected readonly searchQuery = signal('');
  protected readonly difficultyFilter = signal<string>('all');
  protected readonly sortBy = signal<string>('name');

  protected readonly filteredRecipes = computed(() => {
    let recipes = [...this.recipeService.recipes()];

    // Search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      recipes = recipes.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Difficulty filter
    const diff = this.difficultyFilter();
    if (diff !== 'all') {
      recipes = recipes.filter(r => r.difficulty === diff);
    }

    // Sort
    const sort = this.sortBy();
    if (sort === 'name') {
      recipes.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'prepTime') {
      recipes.sort((a, b) => a.prepTime - b.prepTime);
    }

    return recipes;
  });

  constructor(protected recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.recipeService.fetchAll();
  }

  setDifficulty(level: string): void {
    this.difficultyFilter.set(level);
  }

  onSearch(): void {
    // Signal is automatically updated via ngModel
  }

  onSort(): void {
    // Signal is automatically updated via ngModel
  }
}
