import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MealPlan } from '../meal-plans/meal-plan.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepo: Repository<MealPlan>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
  ) {}

  async getShoppingList(start: string, end: string) {
    // Get all meal plans in the date range
    const mealPlans = await this.mealPlanRepo.find({
      where: {
        date: Between(start, end),
      },
      relations: { recipe: true },
    });

    // Get all recipe IDs
    const recipeIds = [...new Set(mealPlans.map((mp) => mp.recipe?.id).filter(Boolean))];

    if (recipeIds.length === 0) {
      return [];
    }

    // Get all ingredients for these recipes
    const recipeIngredients = await this.recipeIngredientRepo.find({
      where: recipeIds.map((id) => ({ recipe: { id } })),
      relations: { ingredient: true },
    });

    // Consolidate by ingredient, summing quantities with same unit
    const consolidated = new Map<
      number,
      {
        ingredient: any;
        quantity: number;
        unit: string;
        notes: string[];
      }
    >();

    for (const ri of recipeIngredients) {
      if (!ri.ingredient) continue;
      const key = ri.ingredient.id;
      const existing = consolidated.get(key);
      if (existing) {
        if (existing.unit === ri.unit) {
          existing.quantity += ri.quantity;
        } else {
          // Different units — keep separate entry
          consolidated.set(key * 1000 + consolidated.size, {
            ingredient: ri.ingredient,
            quantity: ri.quantity,
            unit: ri.unit,
            notes: ri.notes ? [ri.notes] : [],
          });
        }
        if (ri.notes && existing.notes.indexOf(ri.notes) === -1) {
          existing.notes.push(ri.notes);
        }
      } else {
        consolidated.set(key, {
          ingredient: ri.ingredient,
          quantity: ri.quantity,
          unit: ri.unit,
          notes: ri.notes ? [ri.notes] : [],
        });
      }
    }

    return Array.from(consolidated.values()).map((item) => ({
      ...item,
      notes: item.notes.length > 0 ? item.notes.join('; ') : null,
    }));
  }
}
