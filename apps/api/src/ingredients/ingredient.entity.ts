import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { RecipeIngredient } from '../recipes/recipe-ingredient.entity';

export enum IngredientCategory {
  PRODUCE = 'produce',
  DAIRY = 'dairy',
  MEAT = 'meat',
  PANTRY = 'pantry',
  GRAIN = 'grain',
  SPICE = 'spice',
  OTHER = 'other',
}

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'text',
    enum: IngredientCategory,
    default: IngredientCategory.OTHER,
  })
  category: IngredientCategory;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RecipeIngredient, (ri) => ri.ingredient)
  recipeIngredients: RecipeIngredient[];
}
