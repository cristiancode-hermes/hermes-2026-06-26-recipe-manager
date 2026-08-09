import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <app-header />
    <main class="min-h-[calc(100vh-4rem)] bg-surface-50 dark:bg-surface-900 text-surface-800 dark:text-surface-100">
      <router-outlet />
    </main>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class App implements OnInit {
  protected readonly title = signal('Personal Cookbook');

  ngOnInit(): void {
    // Restore dark mode on ANY route (not just home) — the class must survive reload
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }
}
