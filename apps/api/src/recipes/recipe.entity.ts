import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { MealPlan } from '../meal-plans/meal-plan.entity';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

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

  @Column({ type: 'text' })
  instructions: string;

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
