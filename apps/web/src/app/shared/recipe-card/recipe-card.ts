import { Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Recipe } from '../../models/recipe.model';
import { DifficultyBadgeComponent } from '../difficulty-badge/difficulty-badge';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [RouterLink, DifficultyBadgeComponent],
  template: `
    <a [routerLink]="['/recipes', recipe().id]" class="block group">
      <div class="bg-white dark:bg-surface-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-surface-200 dark:border-surface-700 overflow-hidden">
        <!-- Image Placeholder -->
        <div class="h-40 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center text-6xl">
          🍽️
        </div>

        <!-- Body -->
        <div class="p-4 space-y-3">
          <h3 class="font-display text-lg font-semibold text-surface-800 dark:text-surface-100 group-hover:text-primary-500 transition-colors line-clamp-1">
            {{ recipe().title }}
          </h3>

          <p class="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
            {{ recipe().description }}
          </p>

          <!-- Badge + timings -->
          <div class="flex items-center justify-between flex-wrap gap-2">
            <app-difficulty-badge [difficulty]="recipe().difficulty" />

            <div class="flex items-center gap-3 text-xs text-surface-500 dark:text-surface-400">
              <span class="flex items-center gap-1">⏱ {{ recipe().prepTime }}m</span>
              <span class="flex items-center gap-1">🍳 {{ recipe().cookTime }}m</span>
              <span class="flex items-center gap-1">👤 {{ recipe().servings }}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class RecipeCardComponent {
  readonly recipe = input.required<Recipe>();
}
