import { IsString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientCategory } from '../ingredient.entity';
import { IsOptional } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Chicken Breast' })
  @IsString()
  name: string;

  @ApiProperty({ enum: IngredientCategory, example: IngredientCategory.MEAT })
  @IsOptional()
  @IsEnum(IngredientCategory)
  category?: IngredientCategory;
}
