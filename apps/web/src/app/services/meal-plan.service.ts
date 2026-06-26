import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { MealPlanEntry, MealPlanDay, WeekPlan } from '../models/meal-plan.model';
import { Recipe } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  readonly weekPlan = signal<WeekPlan | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async fetchWeek(weekStart: string): Promise<WeekPlan | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const plan = await firstValueFrom(
        this.http.get<WeekPlan>(`/api/meal-plans?weekStart=${weekStart}`)
      );
      this.weekPlan.set(plan);
      return plan;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load meal plan');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async addEntry(entry: { date: string; slot: string; recipeId: string }): Promise<MealPlanEntry | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const newEntry = await firstValueFrom(
        this.http.post<MealPlanEntry>('/api/meal-plans', entry)
      );
      // Refresh the week plan
      const plan = this.weekPlan();
      if (plan) {
        await this.fetchWeek(plan.weekStart);
      }
      return newEntry;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to add meal plan entry');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async removeEntry(entryId: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete(`/api/meal-plans/${entryId}`));
      const plan = this.weekPlan();
      if (plan) {
        await this.fetchWeek(plan.weekStart);
      }
      return true;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to remove meal plan entry');
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async generateShoppingList(weekStart: string, weekEnd: string): Promise<any> {
    try {
      return await firstValueFrom(
        this.http.post('/api/shopping-lists/generate', { weekStart, weekEnd })
      );
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to generate shopping list');
      return null;
    }
  }

  getWeekStart(date: Date = new Date()): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  getWeekEnd(weekStart: string): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  getWeekDays(weekStart: string): MealPlanDay[] {
    const days: MealPlanDay[] = [];
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dateLabel: weekdays[i],
        breakfast: null,
        lunch: null,
        dinner: null,
        snack: null,
      });
    }
    return days;
  }
}
