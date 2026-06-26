import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-difficulty-badge',
  standalone: true,
  template: `
    <span [class]="badgeClass()">
      {{ icon() }} {{ label() }}
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
  `]
})
export class DifficultyBadgeComponent {
  readonly difficulty = input.required<string>();

  protected readonly badgeClass = computed(() => {
    const base = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (this.difficulty()) {
      case 'easy': return `${base} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'medium': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'hard': return `${base} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      default: return `${base} bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300`;
    }
  });

  protected readonly icon = computed(() => {
    switch (this.difficulty()) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  });

  protected readonly label = computed(() => {
    switch (this.difficulty()) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return this.difficulty();
    }
  });
}
