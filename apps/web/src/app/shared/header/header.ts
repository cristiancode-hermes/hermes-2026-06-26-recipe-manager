import { Component, signal, computed, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <header class="bg-surface-50 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <a routerLink="/" class="flex items-center gap-2">
            <span class="text-3xl">🍽️</span>
            <span class="font-display text-xl font-bold text-primary-500 dark:text-primary-400">Cookbook</span>
          </a>

          <!-- Desktop Nav -->
          <nav class="hidden md:flex items-center gap-6">
            <a routerLink="/" routerLinkActive="text-primary-500 font-semibold" class="text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Home</a>
            <a routerLink="/recipes" routerLinkActive="text-primary-500 font-semibold" class="text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Recipes</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/meal-planner" routerLinkActive="text-primary-500 font-semibold" class="text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Meal Planner</a>
              <a routerLink="/shopping-list" routerLinkActive="text-primary-500 font-semibold" class="text-surface-600 dark:text-surface-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">Shopping List</a>
            }
          </nav>

          <!-- Desktop right side -->
          <div class="hidden md:flex items-center gap-4">
            <!-- Dark mode toggle -->
            <button (click)="toggleDarkMode()" class="p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Toggle dark mode">
              @if (isDarkMode()) {
                <span class="text-xl">☀️</span>
              } @else {
                <span class="text-xl">🌙</span>
              }
            </button>

            <!-- Auth buttons -->
            @if (auth.isAuthenticated()) {
              <span class="text-sm text-surface-500 dark:text-surface-400">{{ auth.user()?.email }}</span>
              <button (click)="auth.logout()" class="px-4 py-2 text-sm bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors">Logout</button>
            } @else {
              <a routerLink="/login" class="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">Login</a>
              <a routerLink="/register" class="px-4 py-2 text-sm bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors">Register</a>
            }
          </div>

          <!-- Hamburger -->
          <button (click)="toggleMobileMenu()" class="md:hidden p-2 rounded-lg text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200" aria-label="Toggle menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              }
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900">
          <div class="px-4 py-3 space-y-2">
            <a routerLink="/" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Home</a>
            <a routerLink="/recipes" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Recipes</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/meal-planner" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Meal Planner</a>
              <a routerLink="/shopping-list" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">Shopping List</a>
            }
            <hr class="border-surface-200 dark:border-surface-700">
            <button (click)="toggleDarkMode()" class="w-full text-left px-3 py-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
              {{ isDarkMode() ? '☀️ Light Mode' : '🌙 Dark Mode' }}
            </button>
            @if (auth.isAuthenticated()) {
              <div class="px-3 py-2 text-sm text-surface-500">{{ auth.user()?.email }}</div>
              <button (click)="auth.logout(); closeMobileMenu()" class="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
            } @else {
              <a routerLink="/login" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-primary-600 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">Login</a>
              <a routerLink="/register" (click)="closeMobileMenu()" class="block px-3 py-2 rounded-lg text-secondary-600 font-medium hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors">Register</a>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    :host { display: block; }
    .dark body { background-color: #1c1917; color: #f5f5f4; }
  `]
})
export class HeaderComponent {
  protected readonly mobileMenuOpen = signal(false);
  protected readonly isDarkMode = signal(false);

  constructor(protected auth: AuthService) {
    this.isDarkMode.set(document.documentElement.classList.contains('dark'));
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  toggleDarkMode(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    if (newVal) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }
}
