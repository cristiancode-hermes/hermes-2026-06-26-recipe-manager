import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    <div class="space-y-4">
      <div class="flex flex-wrap gap-4">
        @for (item of [1,2,3,4,5,6]; track item) {
          <div class="flex-1 min-w-[280px] max-w-[360px]">
            <div class="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden animate-pulse">
              <div class="h-40 bg-surface-200 dark:bg-surface-700"></div>
              <div class="p-4 space-y-3">
                <div class="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4"></div>
                <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full"></div>
                <div class="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
                <div class="flex gap-2">
                  <div class="h-6 bg-surface-200 dark:bg-surface-700 rounded-full w-16"></div>
                  <div class="h-6 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LoadingSkeletonComponent {}
