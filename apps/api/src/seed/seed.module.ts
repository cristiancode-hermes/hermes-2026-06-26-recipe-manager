import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../auth/user.entity';
import { Ingredient } from '../ingredients/ingredient.entity';
import { Recipe } from '../recipes/recipe.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { MealPlan } from '../meal-plans/meal-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Ingredient, Recipe, RecipeIngredient, MealPlan]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
