import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { User, AuthResponse, LoginPayload, RegisterPayload } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'cookbook_token';
  private readonly userKey = 'cookbook_user';

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.user.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(payload: LoginPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>('/api/auth/login', payload).subscribe({
        next: (res) => {
          this.storeAuth(res);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  register(payload: RegisterPayload): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<AuthResponse>('/api/auth/register', payload).subscribe({
        next: (res) => {
          this.storeAuth(res);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.access_token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.user.set(res.user);
    this.isAuthenticated.set(true);
  }

  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.isAuthenticated.set(false);
  }
}
