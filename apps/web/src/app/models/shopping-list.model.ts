export interface ShoppingItem {
  id?: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  category: string;
  acquired: boolean;
  mealPlanEntryId?: string;
}

export interface ShoppingList {
  id?: string;
  weekStart: string;
  weekEnd: string;
  items: ShoppingItem[];
  createdAt?: string;
}
