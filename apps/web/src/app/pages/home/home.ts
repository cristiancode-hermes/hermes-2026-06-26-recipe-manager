import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { RecipeCardComponent } from '../../shared/recipe-card/recipe-card';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton';
import { DifficultyBadgeComponent } from '../../shared/difficulty-badge/difficulty-badge';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RecipeCardComponent, LoadingSkeletonComponent, DifficultyBadgeComponent],
  template: `
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-surface-900 dark:via-surface-800 dark:to-surface-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div class="flex flex-col md:flex-row items-center gap-12">
          <div class="flex-1 text-center md:text-left">
            <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-surface-900 dark:text-surface-50 leading-tight">
              Your Personal<br>
              <span class="text-primary-500">Cookbook</span>
            </h1>
            <p class="mt-4 text-lg text-surface-600 dark:text-surface-400 max-w-lg">
              Store, organize, and plan your favorite recipes. From everyday meals to special occasions — keep them all in one place.
            </p>
            <div class="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <a routerLink="/recipes" class="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors">
                Explore Recipes
                <span>→</span>
              </a>
              <a routerLink="/recipes/new" class="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                + Add Recipe
              </a>
            </div>
            <div class="mt-6">
              <button (click)="randomRecipe()" class="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 underline underline-offset-2 transition-colors">
                🎲 Surprise me with a random recipe!
              </button>
            </div>
          </div>
          <div class="flex-1 text-center">
            <div class="text-[10rem] md:text-[14rem] leading-none">👨‍🍳</div>
            <p class="mt-2 text-surface-400 dark:text-surface-500 text-sm">Your digital kitchen companion</p>
          </div>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
    </section>

    <!-- Featured Recipes -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="font-display text-2xl md:text-3xl font-bold text-surface-800 dark:text-surface-100">Featured Recipes</h2>
        <a routerLink="/recipes" class="text-primary-500 hover:text-primary-600 font-medium text-sm">View all →</a>
      </div>

      @if (recipeService.loading()) {
        <app-loading-skeleton />
      } @else if (recipeService.error()) {
        <div class="text-center py-8">
          <p class="text-red-500">{{ recipeService.error() }}</p>
          <button (click)="loadRecipes()" class="mt-2 text-primary-500 hover:underline">Try again</button>
        </div>
      } @else if (featuredRecipes().length === 0) {
        <div class="text-center py-16">
          <div class="text-6xl mb-4">📖</div>
          <h3 class="text-xl font-display font-semibold text-surface-800 dark:text-surface-100 mb-2">No recipes yet</h3>
          <p class="text-surface-500 dark:text-surface-400">Get started by adding your first recipe!</p>
          <a routerLink="/recipes/new" class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
            + Add Your First Recipe
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (recipe of featuredRecipes(); track recipe.id) {
            <app-recipe-card [recipe]="recipe" />
          }
        </div>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class HomeComponent implements OnInit {
  protected readonly featuredRecipes = computed(() =>
    this.recipeService.recipes().slice(0, 4)
  );

  constructor(protected recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
    this.initDarkMode();
  }

  private initDarkMode(): void {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
    }
  }

  loadRecipes(): void {
    this.recipeService.fetchAll();
  }

  randomRecipe(): void {
    const recipes = this.recipeService.recipes();
    if (recipes.length === 0) {
      this.loadRecipes();
      return;
    }
    const randomIndex = Math.floor(Math.random() * recipes.length);
    const recipe = recipes[randomIndex];
    if (recipe?.id) {
      window.location.href = `/recipes/${recipe.id}`;
    }
  }
}
