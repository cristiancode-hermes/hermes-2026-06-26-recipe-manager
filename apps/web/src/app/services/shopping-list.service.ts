import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ShoppingList, ShoppingItem } from '../models/shopping-list.model';

/**
 * Aligned to the real backend API (GET /api/shopping-list?start=&end=).
 * The backend returns a flat array of consolidated ingredients.
 */
@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  readonly shoppingList = signal<ShoppingList | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async fetch(weekStart: string, weekEnd: string): Promise<ShoppingList | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const items = await firstValueFrom(
        this.http.get<any[]>(`/api/shopping-list?start=${weekStart}&end=${weekEnd}`)
      );
      const list: ShoppingList = {
        weekStart,
        weekEnd,
        items: (items ?? []).map((it) => ({
          id: String(it.ingredient?.id ?? Math.random()),
          ingredientName: it.ingredient?.name ?? '',
          quantity: it.quantity,
          unit: it.unit,
          category: it.ingredient?.category ?? '',
          acquired: false,
        })),
      };
      this.shoppingList.set(list);
      return list;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load shopping list');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  exportCsv(weekStart: string, weekEnd: string): Promise<Blob> {
    return firstValueFrom(
      this.http.get(`/api/shopping-list/export?start=${weekStart}&end=${weekEnd}`, {
        responseType: 'blob',
      })
    );
  }

  async toggleItem(itemId: string, acquired: boolean): Promise<boolean> {
    // Local toggle (the backend computes the list on the fly, no persistence)
    const list = this.shoppingList();
    if (list) {
      list.items = list.items.map((item) =>
        item.id === itemId ? { ...item, acquired } : item
      );
      this.shoppingList.set({ ...list });
    }
    return true;
  }
}
