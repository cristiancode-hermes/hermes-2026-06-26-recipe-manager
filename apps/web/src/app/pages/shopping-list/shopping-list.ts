import { Component, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ShoppingListService } from '../../services/shopping-list.service';
import { ShoppingList, ShoppingItem } from '../../models/shopping-list.model';
import { LoadingSkeletonComponent } from '../../shared/loading-skeleton/loading-skeleton';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [FormsModule, DatePipe, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 class="font-display text-3xl font-bold text-surface-800 dark:text-surface-100">🛒 Shopping List</h1>

        <!-- Date range picker -->
        <div class="flex items-center gap-2">
          <input
            type="date"
            [(ngModel)]="startDate"
            (change)="loadList()"
            class="px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span class="text-surface-400">→</span>
          <input
            type="date"
            [(ngModel)]="endDate"
            (change)="loadList()"
            class="px-3 py-2 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      @if (shoppingListService.loading()) {
        <app-loading-skeleton />
      } @else if (shoppingListService.error()) {
        <div class="text-center py-16">
          <p class="text-red-500">{{ shoppingListService.error() }}</p>
          <button (click)="loadList()" class="mt-2 text-primary-500 hover:underline">Try again</button>
        </div>
      } @else if (groupedItems().length === 0) {
        <app-empty-state
          icon="🛒"
          title="Shopping list is empty"
          message="Add meals to your meal planner and generate a shopping list."
        />
      } @else {
        <!-- Progress -->
        <div class="mb-6">
          <div class="flex items-center justify-between text-sm mb-2">
            <span class="text-surface-600 dark:text-surface-400">{{ acquiredCount() }} / {{ totalCount() }} items acquired</span>
            <span class="text-surface-500">{{ progressPercent() }}%</span>
          </div>
          <div class="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-secondary-500 rounded-full transition-all duration-500"
              [style.width.%]="progressPercent()"
            ></div>
          </div>
        </div>

        <!-- Grouped by category -->
        <div class="space-y-6">
          @for (group of groupedItems(); track group.category) {
            <div>
              <h3 class="font-display text-lg font-semibold text-surface-700 dark:text-surface-300 mb-3 capitalize border-b border-surface-200 dark:border-surface-700 pb-2">
                {{ group.category || 'Other' }}
              </h3>
              <div class="space-y-1">
                @for (item of group.items; track item.id) {
                  <label class="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors cursor-pointer"
                    [class.line-through]="item.acquired"
                    [class.text-surface-400]="item.acquired"
                  >
                    <input
                      type="checkbox"
                      [checked]="item.acquired"
                      (change)="toggleItem(item)"
                      class="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span class="flex-1 text-sm" [class.line-through]="item.acquired">
                      {{ item.ingredientName }}
                    </span>
                    <span class="text-sm text-surface-500">
                      {{ item.quantity }} {{ item.unit }}
                    </span>
                  </label>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ShoppingListComponent implements OnInit {
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');

  protected readonly groupedItems = computed(() => {
    const list = this.shoppingListService.shoppingList();
    if (!list?.items) return [];

    const groups = new Map<string, ShoppingItem[]>();
    for (const item of list.items) {
      const cat = item.category || 'Other';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(item);
    }

    return Array.from(groups.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  });

  protected readonly totalCount = computed(() => {
    return this.shoppingListService.shoppingList()?.items?.length ?? 0;
  });

  protected readonly acquiredCount = computed(() => {
    return this.shoppingListService.shoppingList()?.items?.filter(i => i.acquired).length ?? 0;
  });

  protected readonly progressPercent = computed(() => {
    const total = this.totalCount();
    if (total === 0) return 0;
    return Math.round((this.acquiredCount() / total) * 100);
  });

  constructor(protected shoppingListService: ShoppingListService) {}

  ngOnInit(): void {
    const now = new Date();
    const monday = this.getMonday(now);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    this.startDate.set(monday.toISOString().split('T')[0]);
    this.endDate.set(sunday.toISOString().split('T')[0]);
    this.loadList();
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  loadList(): void {
    if (this.startDate() && this.endDate()) {
      this.shoppingListService.fetch(this.startDate(), this.endDate());
    }
  }

  async toggleItem(item: ShoppingItem): Promise<void> {
    if (item.id) {
      await this.shoppingListService.toggleItem(item.id, !item.acquired);
    }
  }
}
