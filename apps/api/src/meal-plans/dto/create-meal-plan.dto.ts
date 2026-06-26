import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from '../meal-plan.entity';

export class CreateMealPlanDto {
  @ApiProperty({ description: 'Recipe ID' })
  @IsInt()
  recipeId: number;

  @ApiProperty({ example: '2026-06-26' })
  @IsString()
  date: string;

  @ApiProperty({ enum: MealType, example: MealType.DINNER })
  @IsEnum(MealType)
  mealType: MealType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
