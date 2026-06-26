import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './shopping-list.service';
import { MealPlan } from '../meal-plans/meal-plan.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan, RecipeIngredient])],
  controllers: [ShoppingListController],
  providers: [ShoppingListService],
})
export class ShoppingListModule {}
