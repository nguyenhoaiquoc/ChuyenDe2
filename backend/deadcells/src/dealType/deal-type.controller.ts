import { Body, Controller, Get, Post } from '@nestjs/common';
import { DealTypeService } from './deal-type.service';

@Controller('deal-types')
export class DealTypeController {
  constructor(private readonly dealTypeService: DealTypeService) { }

  @Get()
  findAll() {
    return this.dealTypeService.findAll();
  }

  @Post()
  async createMany(@Body() names: string[]) {
    return this.dealTypeService.createMany(names);
  }
}
