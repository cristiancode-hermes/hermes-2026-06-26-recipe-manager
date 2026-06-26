import { Component, input, output, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" (click)="cancel()"></div>

        <!-- Dialog -->
        <div class="relative bg-white dark:bg-surface-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-surface-200 dark:border-surface-700">
          <div class="text-center">
            <div class="text-4xl mb-3">{{ icon() }}</div>
            <h3 class="text-lg font-semibold text-surface-800 dark:text-surface-100 mb-2">{{ title() }}</h3>
            <p class="text-surface-500 dark:text-surface-400 mb-6">{{ message() }}</p>
            <div class="flex gap-3 justify-center">
              <button (click)="cancel()" class="px-4 py-2 text-sm rounded-lg border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                {{ cancelLabel() }}
              </button>
              <button (click)="confirm()" class="px-4 py-2 text-sm rounded-lg text-white transition-colors" [class]="confirmClass()">
                {{ confirmLabel() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class ConfirmDialogComponent {
  readonly visible = input(false);
  readonly title = input('Confirm');
  readonly message = input('Are you sure?');
  readonly icon = input('⚠️');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly confirmVariant = input<'danger' | 'primary' | 'secondary'>('danger');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly confirmClass = () => {
    const base = 'px-4 py-2 text-sm rounded-lg text-white transition-colors';
    switch (this.confirmVariant()) {
      case 'danger': return `${base} bg-red-600 hover:bg-red-700`;
      case 'primary': return `${base} bg-primary-500 hover:bg-primary-600`;
      case 'secondary': return `${base} bg-secondary-500 hover:bg-secondary-600`;
      default: return `${base} bg-primary-500 hover:bg-primary-600`;
    }
  };

  confirm(): void {
    this.confirmed.emit();
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
