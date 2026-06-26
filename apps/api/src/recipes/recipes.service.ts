import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
  ) {}

  async findAll(query: {
    search?: string;
    difficulty?: string;
    category?: string;
    sort?: string;
  }) {
    const where: any = {};

    if (query.search) {
      where.title = Like(`%${query.search}%`);
    }
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    const order: any = {};
    if (query.sort === 'title') {
      order.title = 'ASC';
    } else if (query.sort === 'newest') {
      order.createdAt = 'DESC';
    } else if (query.sort === 'oldest') {
      order.createdAt = 'ASC';
    } else {
      order.createdAt = 'DESC';
    }

    const recipes = await this.recipeRepo.find({
      where,
      order,
      relations: { ingredients: { ingredient: true } },
    });

    // Filter by category if specified (since category is on ingredient, not recipe)
    if (query.category) {
      return recipes.filter((r) =>
        r.ingredients?.some(
          (ri) => ri.ingredient?.category === query.category,
        ),
      );
    }

    return recipes;
  }

  async findOne(id: number) {
    const recipe = await this.recipeRepo.findOne({
      where: { id },
      relations: { ingredients: { ingredient: true } },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe #${id} not found`);
    }
    return recipe;
  }

  async create(dto: CreateRecipeDto) {
    const { ingredients, ...recipeData } = dto;

    const recipe = this.recipeRepo.create({
      ...recipeData,
      instructions: JSON.stringify(recipeData.instructions),
    });
    await this.recipeRepo.save(recipe);

    if (ingredients && ingredients.length > 0) {
      const recipeIngredients = ingredients.map((ri) =>
        this.recipeIngredientRepo.create({
          recipe: { id: recipe.id },
          ingredient: { id: ri.ingredientId },
          quantity: ri.quantity,
          unit: ri.unit,
          notes: ri.notes,
        }),
      );
      await this.recipeIngredientRepo.save(recipeIngredients);
    }

    return this.findOne(recipe.id);
  }

  async update(id: number, dto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);

    const { ingredients, instructions, ...updateData } = dto;

    if (instructions) {
      (updateData as any).instructions = JSON.stringify(instructions);
    }

    await this.recipeRepo.update(id, updateData as any);

    if (ingredients) {
      // Remove old ingredients and add new ones
      await this.recipeIngredientRepo.delete({ recipe: { id } });

      const newIngredients = ingredients
        .filter((ri) => ri.ingredientId)
        .map((ri) =>
          this.recipeIngredientRepo.create({
            recipe: { id },
            ingredient: { id: ri.ingredientId },
            quantity: ri.quantity,
            unit: ri.unit,
            notes: ri.notes,
          }),
        );
      if (newIngredients.length > 0) {
        await this.recipeIngredientRepo.save(newIngredients);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const recipe = await this.findOne(id);
    await this.recipeRepo.remove(recipe);
    return { deleted: true, id };
  }
}
