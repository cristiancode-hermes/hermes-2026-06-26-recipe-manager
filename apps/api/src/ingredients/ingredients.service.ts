import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepo: Repository<Ingredient>,
  ) {}

  async findAll() {
    return this.ingredientRepo.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateIngredientDto) {
    const existing = await this.ingredientRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Ingredient '${dto.name}' already exists`);
    }

    const ingredient = this.ingredientRepo.create(dto);
    return this.ingredientRepo.save(ingredient);
  }
}
