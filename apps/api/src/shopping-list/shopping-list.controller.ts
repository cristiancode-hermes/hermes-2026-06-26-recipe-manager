import { Controller, Get, Query, Res } from '@nestjs/common';
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

  @Get('export')
  @ApiOperation({ summary: 'Export shopping list as CSV' })
  @ApiQuery({ name: 'start', required: true, example: '2026-06-26' })
  @ApiQuery({ name: 'end', required: true, example: '2026-06-28' })
  async exportCsv(
    @Query('start') start: string,
    @Query('end') end: string,
    @Res() res: any,
  ) {
    const { filename, csv } =
      await this.shoppingListService.exportCsv(start, end);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}
