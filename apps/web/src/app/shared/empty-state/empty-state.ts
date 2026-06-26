import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="text-center py-16 px-4">
      <div class="text-6xl mb-4">{{ icon() }}</div>
      <h3 class="text-xl font-display font-semibold text-surface-800 dark:text-surface-100 mb-2">{{ title() }}</h3>
      <p class="text-surface-500 dark:text-surface-400 max-w-md mx-auto">{{ message() }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class EmptyStateComponent {
  readonly icon = input<string>('📭');
  readonly title = input<string>('Nothing here yet');
  readonly message = input<string>('Get started by adding some content.');
}
