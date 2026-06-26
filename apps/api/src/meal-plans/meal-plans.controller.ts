import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MealPlansService } from './meal-plans.service';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Meal Plans')
@Controller('meal-plans')
export class MealPlansController {
  constructor(
    private readonly mealPlansService: MealPlansService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List meal plans for a date range' })
  @ApiQuery({ name: 'start', required: true, example: '2026-06-26' })
  @ApiQuery({ name: 'end', required: true, example: '2026-06-28' })
  findByDateRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.mealPlansService.findByDateRange(start, end);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a meal to the plan' })
  create(@Body() dto: CreateMealPlanDto) {
    return this.mealPlansService.create(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a meal from the plan' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.mealPlansService.remove(id);
  }
}
