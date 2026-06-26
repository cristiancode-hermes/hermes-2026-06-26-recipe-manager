import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { Recipe, Difficulty } from './recipe.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';

describe('RecipesService', () => {
  let service: RecipesService;
  let recipeRepo: any;
  let recipeIngredientRepo: any;

  const mockRecipe: Recipe = {
    id: 1,
    title: 'Test Recipe',
    description: 'A test recipe',
    prepTime: 10,
    cookTime: 20,
    difficulty: Difficulty.EASY,
    servings: 4,
    instructions: '["Step 1", "Step 2"]',
    imageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredients: [],
    mealPlans: [],
  };

  beforeEach(async () => {
    recipeRepo = {
      find: jest.fn().mockResolvedValue([mockRecipe]),
      findOne: jest.fn().mockResolvedValue(mockRecipe),
      save: jest.fn().mockResolvedValue(mockRecipe),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      remove: jest.fn().mockResolvedValue(mockRecipe),
      create: jest.fn().mockReturnValue(mockRecipe),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    recipeIngredientRepo = {
      save: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockReturnValue({}),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        { provide: getRepositoryToken(Recipe), useValue: recipeRepo },
        { provide: getRepositoryToken(RecipeIngredient), useValue: recipeIngredientRepo },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all recipes without filters', async () => {
      const result = await service.findAll({});
      expect(result).toEqual([mockRecipe]);
      expect(recipeRepo.find).toHaveBeenCalled();
    });

    it('should filter by difficulty', async () => {
      const result = await service.findAll({ difficulty: 'easy' });
      expect(result).toEqual([mockRecipe]);
      expect(recipeRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ difficulty: 'easy' }),
        })
      );
    });

    it('should filter by search query', async () => {
      const result = await service.findAll({ search: 'chicken' });
      expect(result).toEqual([mockRecipe]);
      expect(recipeRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ title: expect.anything() }),
        })
      );
    });

    it('should handle empty result set', async () => {
      recipeRepo.find.mockResolvedValue([]);
      const result = await service.findAll({});
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockRecipe);
      expect(recipeRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1 } })
      );
    });

    it('should throw NotFoundException for non-existent recipe', async () => {
      recipeRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a recipe', async () => {
      const dto: any = {
        title: 'New Recipe',
        description: 'Description',
        prepTime: 10,
        cookTime: 20,
        difficulty: Difficulty.EASY,
        servings: 4,
        instructions: ['Step 1'],
        ingredients: [{ ingredientId: 1, quantity: 1, unit: 'tsp' }],
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockRecipe);
      expect(recipeRepo.save).toHaveBeenCalled();
    });

    it('should create a recipe without ingredients', async () => {
      const dto: any = {
        title: 'Minimal Recipe',
        description: 'No ingredients',
        prepTime: 5,
        cookTime: 10,
        difficulty: Difficulty.EASY,
        servings: 1,
        instructions: ['Do stuff'],
      };

      const result = await service.create(dto);
      expect(result).toEqual(mockRecipe);
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      const dto: any = { title: 'Updated', instructions: ['New step'] };
      const result = await service.update(1, dto);
      expect(result).toEqual(mockRecipe);
      expect(recipeRepo.update).toHaveBeenCalled();
    });

    it('should throw for non-existent recipe update', async () => {
      recipeRepo.findOne.mockResolvedValue(null);
      await expect(service.update(999, { title: 'Nope' } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a recipe', async () => {
      const result = await service.remove(1);
      expect(result).toEqual({ deleted: true, id: 1 });
      expect(recipeRepo.remove).toHaveBeenCalledWith(mockRecipe);
    });
  });
});
