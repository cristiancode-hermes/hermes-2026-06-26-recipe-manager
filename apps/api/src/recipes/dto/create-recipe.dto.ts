import {
  IsString,
  IsInt,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty } from '../recipe.entity';

class CreateRecipeIngredientDto {
  @ApiProperty({ description: 'Ingredient ID' })
  @IsInt()
  ingredientId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'cups' })
  @IsString()
  unit: string;

  @ApiPropertyOptional({ example: 'finely diced' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Classic Chicken Stir-fry' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A delicious stir-fry...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  prepTime: number;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(0)
  cookTime: number;

  @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  servings: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: '["Step 1: Do this", "Step 2: Do that"]',
  })
  @IsArray()
  instructions: string[];

  @ApiPropertyOptional({
    type: [CreateRecipeIngredientDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients?: CreateRecipeIngredientDto[];
}
