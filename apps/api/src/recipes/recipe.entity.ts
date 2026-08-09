import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ValueTransformer,
} from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { MealPlan } from '../meal-plans/meal-plan.entity';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * Stores `string[]` as a JSON string in the DB (text column) and parses it
 * back to an array on read. Fixes the bug where the API returned the raw
 * JSON string and the frontend @for iterated it character by character.
 * `to` passes plain strings through untouched (legacy seed writes), so
 * existing rows with JSON strings hydrate correctly without migration.
 */
export const instructionsTransformer: ValueTransformer = {
  to: (value: string[] | string | null | undefined): string => {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }
    if (typeof value === 'string') {
      return value;
    }
    return '[]';
  },
  from: (value: string | null | undefined): string[] => {
    if (!value) {
      return [];
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [value];
    }
  },
};

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'prep_time', type: 'int' })
  prepTime: number;

  @Column({ name: 'cook_time', type: 'int' })
  cookTime: number;

  @Column({
    type: 'text',
    enum: Difficulty,
    default: Difficulty.EASY,
  })
  difficulty: Difficulty;

  @Column({ type: 'int' })
  servings: number;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', transformer: instructionsTransformer })
  instructions: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, {
    cascade: true,
    eager: false,
  })
  ingredients: RecipeIngredient[];

  @OneToMany(() => MealPlan, (mp) => mp.recipe)
  mealPlans: MealPlan[];
}
