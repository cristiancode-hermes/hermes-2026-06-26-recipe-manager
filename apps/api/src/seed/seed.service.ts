import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../auth/user.entity';
import { Ingredient, IngredientCategory } from '../ingredients/ingredient.entity';
import { Recipe, Difficulty } from '../recipes/recipe.entity';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';
import { MealPlan, MealType } from '../meal-plans/meal-plan.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
    @InjectRepository(Recipe)
    private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepo: Repository<RecipeIngredient>,
    @InjectRepository(MealPlan)
    private readonly mealPlanRepo: Repository<MealPlan>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userRepo.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding database...');

    // 1. Demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const demoUser = await this.userRepo.save({
      email: 'demo@cookbook.local',
      name: 'Demo User',
      password: hashedPassword,
    });

    // 2. Ingredients
    const ingredientData = [
      { name: 'Chicken Breast', category: IngredientCategory.MEAT },
      { name: 'Olive Oil', category: IngredientCategory.PANTRY },
      { name: 'Garlic', category: IngredientCategory.PRODUCE },
      { name: 'Rice', category: IngredientCategory.GRAIN },
      { name: 'Tomatoes', category: IngredientCategory.PRODUCE },
      { name: 'Onion', category: IngredientCategory.PRODUCE },
      { name: 'Bell Peppers', category: IngredientCategory.PRODUCE },
      { name: 'Pasta', category: IngredientCategory.GRAIN },
      { name: 'Eggs', category: IngredientCategory.DAIRY },
      { name: 'Milk', category: IngredientCategory.DAIRY },
      { name: 'Butter', category: IngredientCategory.DAIRY },
      { name: 'Flour', category: IngredientCategory.PANTRY },
      { name: 'Sugar', category: IngredientCategory.PANTRY },
      { name: 'Salt', category: IngredientCategory.SPICE },
      { name: 'Black Pepper', category: IngredientCategory.SPICE },
      { name: 'Cumin', category: IngredientCategory.SPICE },
      { name: 'Paprika', category: IngredientCategory.SPICE },
      { name: 'Lemon', category: IngredientCategory.PRODUCE },
      { name: 'Soy Sauce', category: IngredientCategory.PANTRY },
      { name: 'Ginger', category: IngredientCategory.PRODUCE },
      { name: 'Cilantro', category: IngredientCategory.PRODUCE },
    ];

    const ingredients = await this.ingredientRepo.save(
      ingredientData.map((i) => this.ingredientRepo.create(i)),
    );

    const ingredientMap = new Map<string, Ingredient>();
    ingredients.forEach((i) => ingredientMap.set(i.name.toLowerCase(), i));

    const getIng = (name: string) => ingredientMap.get(name.toLowerCase())!;

    // 3. Recipes
    // Recipe 1: Classic Chicken Stir-fry
    const recipe1 = await this.recipeRepo.save({
      title: 'Classic Chicken Stir-fry',
      description: 'A quick and easy chicken stir-fry with vegetables and soy sauce.',
      prepTime: 15,
      cookTime: 20,
      difficulty: Difficulty.EASY,
      servings: 4,
      instructions: JSON.stringify([
        'Dice chicken breast into bite-sized pieces.',
        'Heat oil in a wok or large pan over high heat.',
        'Add chicken and cook until golden, about 5-7 minutes.',
        'Add minced garlic and grated ginger, cook for 1 minute.',
        'Add sliced bell peppers and cook for 2-3 minutes.',
        'Add soy sauce and stir-fry for another 2 minutes.',
        'Serve over steamed rice. Garnish with cilantro.',
      ]),
    });

    await this.recipeIngredientRepo.save(
      [
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Chicken Breast').id }, quantity: 2, unit: 'pieces', notes: 'diced' },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Olive Oil').id }, quantity: 2, unit: 'tbsp', notes: null },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Garlic').id }, quantity: 3, unit: 'cloves', notes: 'minced' },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Rice').id }, quantity: 2, unit: 'cups', notes: 'cooked' },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Soy Sauce').id }, quantity: 3, unit: 'tbsp', notes: null },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Ginger').id }, quantity: 1, unit: 'tbsp', notes: 'grated' },
        { recipe: { id: recipe1.id }, ingredient: { id: getIng('Bell Peppers').id }, quantity: 2, unit: 'pieces', notes: 'sliced' },
      ] as any,
    );

    // Recipe 2: Creamy Garlic Pasta
    const recipe2 = await this.recipeRepo.save({
      title: 'Creamy Garlic Pasta',
      description: 'Rich and creamy pasta with garlic butter sauce.',
      prepTime: 10,
      cookTime: 25,
      difficulty: Difficulty.MEDIUM,
      servings: 4,
      instructions: JSON.stringify([
        'Bring a large pot of salted water to a boil.',
        'Cook pasta according to package directions until al dente.',
        'While pasta cooks, melt butter in a pan over medium heat.',
        'Add minced garlic and sauté for 1 minute.',
        'Add milk, salt, and pepper. Simmer until slightly thickened.',
        'Drain pasta and toss with the creamy garlic sauce.',
        'Serve hot with grated parmesan if desired.',
      ]),
    });

    await this.recipeIngredientRepo.save([
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Pasta').id }, quantity: 1, unit: 'lb', notes: null },
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Garlic').id }, quantity: 4, unit: 'cloves', notes: 'minced' },
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Butter').id }, quantity: 3, unit: 'tbsp', notes: null },
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Milk').id }, quantity: 1.5, unit: 'cups', notes: null },
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Salt').id }, quantity: 1, unit: 'tsp', notes: 'to taste' },
      { recipe: { id: recipe2.id }, ingredient: { id: getIng('Black Pepper').id }, quantity: 0.5, unit: 'tsp', notes: 'to taste' },
    ] as any);

    // Recipe 3: Spicy Tomato Rice
    const recipe3 = await this.recipeRepo.save({
      title: 'Spicy Tomato Rice',
      description: 'A flavorful one-pot rice dish with tomatoes and warm spices.',
      prepTime: 10,
      cookTime: 30,
      difficulty: Difficulty.EASY,
      servings: 6,
      instructions: JSON.stringify([
        'Heat oil in a large pot over medium heat.',
        'Sauté diced onion until translucent, about 5 minutes.',
        'Add minced garlic, cumin, and paprika. Cook for 1 minute.',
        'Add diced tomatoes and cook for 5 minutes, stirring occasionally.',
        'Add rice, salt, and 3 cups of water. Bring to a boil.',
        'Reduce heat, cover, and simmer for 15-20 minutes until rice is tender.',
        'Fluff with a fork and serve.',
      ]),
    });

    await this.recipeIngredientRepo.save([
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Rice').id }, quantity: 2, unit: 'cups', notes: null },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Tomatoes').id }, quantity: 3, unit: 'pieces', notes: 'diced' },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Onion').id }, quantity: 1, unit: 'pieces', notes: 'diced' },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Garlic').id }, quantity: 2, unit: 'cloves', notes: 'minced' },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Cumin').id }, quantity: 1, unit: 'tsp', notes: null },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Paprika').id }, quantity: 1, unit: 'tsp', notes: null },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Olive Oil').id }, quantity: 2, unit: 'tbsp', notes: null },
      { recipe: { id: recipe3.id }, ingredient: { id: getIng('Salt').id }, quantity: 1, unit: 'tsp', notes: 'to taste' },
    ] as any);

    // Recipe 4: Fluffy Pancakes
    const recipe4 = await this.recipeRepo.save({
      title: 'Fluffy Pancakes',
      description: 'Light and fluffy pancakes perfect for breakfast.',
      prepTime: 10,
      cookTime: 15,
      difficulty: Difficulty.EASY,
      servings: 4,
      instructions: JSON.stringify([
        'In a large bowl, whisk together flour, sugar, salt, and baking powder.',
        'In another bowl, beat eggs, then add milk and melted butter.',
        'Pour wet ingredients into dry ingredients and stir until just combined.',
        'Heat a griddle or pan over medium heat and lightly grease.',
        'Pour batter onto the griddle, about 1/4 cup per pancake.',
        'Cook until bubbles form on the surface, then flip and cook until golden.',
        'Serve with maple syrup and fresh fruit.',
      ]),
    });

    await this.recipeIngredientRepo.save([
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Eggs').id }, quantity: 2, unit: 'pieces', notes: null },
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Milk').id }, quantity: 1.5, unit: 'cups', notes: null },
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Flour').id }, quantity: 2, unit: 'cups', notes: null },
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Sugar').id }, quantity: 2, unit: 'tbsp', notes: null },
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Butter').id }, quantity: 3, unit: 'tbsp', notes: 'melted' },
      { recipe: { id: recipe4.id }, ingredient: { id: getIng('Salt').id }, quantity: 0.5, unit: 'tsp', notes: null },
    ] as any);

    // 4. Meal Plans (today and next 2 days)
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    await this.mealPlanRepo.save([
      { recipe: { id: recipe1.id }, date: formatDate(today), mealType: MealType.DINNER, notes: null },
      {
        recipe: { id: recipe4.id },
        date: formatDate(new Date(today.getTime() + 86400000)),
        mealType: MealType.BREAKFAST,
        notes: 'Add blueberries',
      },
      {
        recipe: { id: recipe2.id },
        date: formatDate(new Date(today.getTime() + 2 * 86400000)),
        mealType: MealType.LUNCH,
        notes: null,
      },
    ] as any);

    this.logger.log('Database seeded successfully!');
    this.logger.log(`Demo user: demo@cookbook.local / password123`);
  }
}
