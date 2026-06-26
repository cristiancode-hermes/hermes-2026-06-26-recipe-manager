import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Recipe, RecipeCreatePayload } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  readonly recipes = signal<Recipe[]>([]);
  readonly currentRecipe = signal<Recipe | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async fetchAll(): Promise<Recipe[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const recipes = await firstValueFrom(this.http.get<Recipe[]>('/api/recipes'));
      this.recipes.set(recipes ?? []);
      return recipes ?? [];
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load recipes');
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async fetchOne(id: string): Promise<Recipe | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const recipe = await firstValueFrom(this.http.get<Recipe>(`/api/recipes/${id}`));
      this.currentRecipe.set(recipe ?? null);
      return recipe ?? null;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load recipe');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async create(payload: RecipeCreatePayload): Promise<Recipe | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const recipe = await firstValueFrom(this.http.post<Recipe>('/api/recipes', payload));
      if (recipe) {
        this.recipes.update(list => [...list, recipe]);
      }
      return recipe ?? null;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to create recipe');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async update(id: string, payload: Partial<RecipeCreatePayload>): Promise<Recipe | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const recipe = await firstValueFrom(this.http.patch<Recipe>(`/api/recipes/${id}`, payload));
      if (recipe) {
        this.recipes.update(list => list.map(r => r.id === id ? recipe : r));
        this.currentRecipe.set(recipe);
      }
      return recipe ?? null;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to update recipe');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async delete(id: string): Promise<boolean> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.http.delete<void>(`/api/recipes/${id}`));
      this.recipes.update(list => list.filter(r => r.id !== id));
      this.currentRecipe.set(null);
      return true;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to delete recipe');
      return false;
    } finally {
      this.loading.set(false);
    }
  }
}
