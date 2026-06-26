import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-surface-50 dark:bg-surface-900">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 p-8">
          <!-- Header -->
          <div class="text-center mb-8">
            <div class="text-5xl mb-2">{{ isLogin() ? '🔑' : '📝' }}</div>
            <h1 class="font-display text-2xl font-bold text-surface-800 dark:text-surface-100">
              {{ isLogin() ? 'Welcome Back' : 'Create Account' }}
            </h1>
            <p class="text-surface-500 dark:text-surface-400 text-sm mt-1">
              {{ isLogin() ? 'Sign in to your cookbook' : 'Start your personal cookbook' }}
            </p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name (register only) -->
            @if (!isLogin()) {
              <div>
                <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Name</label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>
            }

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Password</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                class="w-full px-4 py-2.5 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
              />
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {{ error() }}
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="submitting()"
              class="w-full py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              @if (submitting()) {
                Signing in...
              } @else {
                {{ isLogin() ? 'Sign In' : 'Create Account' }}
              }
            </button>
          </form>

          <!-- Toggle -->
          <div class="text-center mt-6">
            <p class="text-sm text-surface-500 dark:text-surface-400">
              @if (isLogin()) {
                Don't have an account?
                <a routerLink="/register" class="text-primary-500 hover:text-primary-600 font-medium">Sign up</a>
              } @else {
                Already have an account?
                <a routerLink="/login" class="text-primary-500 hover:text-primary-600 font-medium">Sign in</a>
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AuthComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private readonly url = inject(Router).routerState.snapshot.url;

  protected readonly isLogin = signal(this.url.includes('login'));
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly name = signal('');

  async onSubmit(): Promise<void> {
    this.submitting.set(true);
    this.error.set(null);

    try {
      if (this.isLogin()) {
        await this.auth.login({
          email: this.email(),
          password: this.password(),
        });
      } else {
        await this.auth.register({
          email: this.email(),
          password: this.password(),
          name: this.name() || undefined,
        });
      }
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(err?.error?.message ?? err?.message ?? 'Authentication failed');
    } finally {
      this.submitting.set(false);
    }
  }
}
