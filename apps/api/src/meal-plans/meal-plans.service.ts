import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MealPlan } from './meal-plan.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';

@Injectable()
export class MealPlansService {
  constructor(
    @InjectRepository(MealPlan)
    private readonly mealPlanRepo: Repository<MealPlan>,
  ) {}

  async findByDateRange(start: string, end: string) {
    return this.mealPlanRepo.find({
      where: {
        date: Between(start, end),
      },
      relations: { recipe: true },
      order: { date: 'ASC', mealType: 'ASC' },
    });
  }

  async create(dto: CreateMealPlanDto) {
    const mealPlan = this.mealPlanRepo.create({
      recipe: { id: dto.recipeId },
      date: dto.date,
      mealType: dto.mealType,
      notes: dto.notes,
    });
    return this.mealPlanRepo.save(mealPlan);
  }

  async remove(id: number) {
    const mealPlan = await this.mealPlanRepo.findOne({ where: { id } });
    if (!mealPlan) {
      throw new NotFoundException(`Meal plan #${id} not found`);
    }
    await this.mealPlanRepo.remove(mealPlan);
    return { deleted: true, id };
  }
}
