import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ShoppingList, ShoppingItem } from '../models/shopping-list.model';

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
      const list = await firstValueFrom(
        this.http.get<ShoppingList>(`/api/shopping-lists?weekStart=${weekStart}&weekEnd=${weekEnd}`)
      );
      this.shoppingList.set(list);
      return list;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to load shopping list');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async toggleItem(itemId: string, acquired: boolean): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.patch(`/api/shopping-lists/items/${itemId}`, { acquired })
      );
      const list = this.shoppingList();
      if (list) {
        list.items = list.items.map(item =>
          item.id === itemId ? { ...item, acquired } : item
        );
        this.shoppingList.set({ ...list });
      }
      return true;
    } catch (err: any) {
      this.error.set(err?.message ?? 'Failed to update item');
      return false;
    }
  }
}
