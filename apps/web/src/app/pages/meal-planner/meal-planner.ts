import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgClass } from '@angular/common';
import { MealPlanService } from '../../services/meal-plan.service';
import { RecipeService } from '../../services/recipe.service';
import { MealPlanDay, MealSlot, MEAL_SLOTS } from '../../models/meal-plan.model';
import { Recipe } from '../../models/recipe.model';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, NgClass, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="font-display text-3xl font-bold text-surface-800 dark:text-surface-100">📅 Meal Planner</h1>
        <div class="flex items-center gap-3">
          <button (click)="previousWeek()" class="p-2 rounded-lg border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            ←
          </button>
          <span class="text-sm font-medium text-surface-700 dark:text-surface-300 min-w-[180px] text-center">
            {{ weekStart() | date:'MMM d' }} - {{ weekEnd() | date:'MMM d, yyyy' }}
          </span>
          <button (click)="nextWeek()" class="p-2 rounded-lg border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            →
          </button>
          <button (click)="today()" class="px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 text-surface-600 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Today
          </button>
        </div>
      </div>

      <!-- Actions bar -->
      <div class="flex gap-3 mb-6">
        <button (click)="generateShoppingList()" class="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm">
          🛒 Generate Shopping List
        </button>
      </div>

      @if (mealPlanService.loading()) {
        <app-loading-skeleton />
      } @else if (mealPlanService.error()) {
        <div class="text-center py-16">
          <p class="text-red-500">{{ mealPlanService.error() }}</p>
          <button (click)="loadWeek()" class="mt-2 text-primary-500 hover:underline">Try again</button>
        </div>
      } @else {
        <!-- Week Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3">
          @for (day of weekDays(); track day.date) {
            <div class="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <!-- Day header -->
              <div class="bg-surface-50 dark:bg-surface-700/50 px-3 py-2 border-b border-surface-200 dark:border-surface-700">
                <p class="text-xs text-surface-500 dark:text-surface-400 font-medium">{{ day.dateLabel }}</p>
                <p class="text-sm font-semibold text-surface-800 dark:text-surface-100">{{ day.date | date:'MMM d' }}</p>
              </div>

              <!-- Meal slots -->
              <div class="p-2 space-y-2">
                @for (slot of mealSlots; track slot) {
                  <div class="min-h-[60px]">
                    @let meal = day[slot];
                    @if (meal && meal.recipeTitle) {
                      <div class="group relative bg-primary-50 dark:bg-primary-900/20 rounded-lg p-2 border border-primary-200 dark:border-primary-800 cursor-pointer" (click)="removeMeal(meal.id!)">
                        <p class="text-[10px] uppercase tracking-wider text-primary-500 font-medium mb-0.5">{{ slot }}</p>
                        <p class="text-xs font-medium text-surface-800 dark:text-surface-100 pr-4">{{ meal.recipeTitle }}</p>
                        <button class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] transition-opacity">×</button>
                      </div>
                    } @else {
                      <button (click)="openAddMealModal(day.date, slot)" class="w-full h-full min-h-[60px] border-2 border-dashed border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all flex items-center justify-center">
                        <span class="text-xs text-surface-400">+ {{ slot }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Meal Modal -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50" (click)="closeAddModal()"></div>
          <div class="relative bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-lg w-full p-6 border border-surface-200 dark:border-surface-700">
            <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-4">
              Add to {{ selectedSlot() }} on {{ selectedDate() | date:'MMM d' }}
            </h3>

            <div class="relative mb-4">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">🔍</span>
              <input
                type="text"
                [(ngModel)]="recipeSearchQuery"
                placeholder="Search recipes..."
                class="w-full pl-10 pr-4 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div class="max-h-[300px] overflow-y-auto space-y-2">
              @for (recipe of filteredRecipes(); track recipe.id) {
                <button
                  (click)="addMeal(recipe)"
                  class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors border border-surface-200 dark:border-surface-700"
                >
                  <p class="font-medium text-sm text-surface-800 dark:text-surface-100">{{ recipe.title }}</p>
                  <p class="text-xs text-surface-500">⏱ {{ recipe.prepTime + recipe.cookTime }} min | 👤 {{ recipe.servings }}</p>
                </button>
              } @empty {
                <p class="text-sm text-surface-400 text-center py-4">No recipes found</p>
              }
            </div>

            <button (click)="closeAddModal()" class="mt-4 w-full px-4 py-2 border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MealPlannerComponent implements OnInit {
  protected readonly mealSlots: MealSlot[] = [...MEAL_SLOTS];
  protected readonly weekStart = signal('');
  protected readonly showAddModal = signal(false);
  protected readonly selectedDate = signal('');
  protected readonly selectedSlot = signal<MealSlot>('breakfast');
  protected readonly recipeSearchQuery = signal('');
  protected readonly allRecipes = signal<Recipe[]>([]);

  protected readonly filteredRecipes = computed(() => {
    const query = this.recipeSearchQuery().toLowerCase().trim();
    if (!query) return this.allRecipes();
    return this.allRecipes().filter(r =>
      r.title.toLowerCase().includes(query)
    );
  });

  protected readonly weekEnd = computed(() => {
    const ws = this.weekStart();
    if (!ws) return '';
    return this.mealPlanService.getWeekEnd(ws);
  });

  protected readonly weekDays = computed(() => {
    const ws = this.weekStart();
    if (!ws) return [];
    const planDays = this.mealPlanService.weekPlan()?.days ?? [];
    if (planDays.length > 0) return planDays;
    return this.mealPlanService.getWeekDays(ws);
  });

  constructor(
    protected mealPlanService: MealPlanService,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    this.weekStart.set(this.mealPlanService.getWeekStart());
    this.loadWeek();
    this.loadRecipes();
  }

  async loadWeek(): Promise<void> {
    await this.mealPlanService.fetchWeek(this.weekStart());
  }

  private async loadRecipes(): Promise<void> {
    const recipes = await this.recipeService.fetchAll();
    this.allRecipes.set(recipes);
  }

  previousWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d.toISOString().split('T')[0]);
    this.loadWeek();
  }

  nextWeek(): void {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d.toISOString().split('T')[0]);
    this.loadWeek();
  }

  today(): void {
    this.weekStart.set(this.mealPlanService.getWeekStart());
    this.loadWeek();
  }

  openAddMealModal(date: string, slot: MealSlot): void {
    this.selectedDate.set(date);
    this.selectedSlot.set(slot);
    this.recipeSearchQuery.set('');
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  async addMeal(recipe: Recipe): Promise<void> {
    if (recipe.id) {
      await this.mealPlanService.addEntry({
        date: this.selectedDate(),
        slot: this.selectedSlot(),
        recipeId: recipe.id,
      });
    }
    this.closeAddModal();
  }

  async removeMeal(entryId: string): Promise<void> {
    if (entryId) {
      await this.mealPlanService.removeEntry(entryId);
    }
  }

  async generateShoppingList(): Promise<void> {
    await this.mealPlanService.generateShoppingList(
      this.weekStart(),
      this.weekEnd()
    );
  }
}
