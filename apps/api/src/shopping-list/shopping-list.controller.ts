import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ShoppingListService } from './shopping-list.service';

@ApiTags('Shopping List')
@Controller('shopping-list')
export class ShoppingListController {
  constructor(
    private readonly shoppingListService: ShoppingListService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get aggregated shopping list for a date range' })
  @ApiQuery({ name: 'start', required: true, example: '2026-06-26' })
  @ApiQuery({ name: 'end', required: true, example: '2026-06-28' })
  getShoppingList(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.shoppingListService.getShoppingList(start, end);
  }
}
