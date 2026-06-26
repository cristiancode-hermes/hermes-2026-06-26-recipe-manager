export interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
}

export interface RecipeCreatePayload {
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface RecipeUpdatePayload extends Partial<RecipeCreatePayload> {}
