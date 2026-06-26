export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealSlot = typeof MEAL_SLOTS[number];

export interface MealPlanEntry {
  id?: string;
  date: string; // ISO date string YYYY-MM-DD
  slot: MealSlot;
  recipeId: string;
  recipeTitle?: string;
}

export interface MealPlanDay {
  date: string;
  dateLabel: string;
  breakfast?: MealPlanEntry | null;
  lunch?: MealPlanEntry | null;
  dinner?: MealPlanEntry | null;
  snack?: MealPlanEntry | null;
  [key: string]: any; // Allow indexed access by slot name
}

export interface WeekPlan {
  weekStart: string; // Monday ISO date
  weekEnd: string;   // Sunday ISO date
  days: MealPlanDay[];
}
