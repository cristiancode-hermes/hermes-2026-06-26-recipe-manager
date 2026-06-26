import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { Recipe } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeIngredient])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
