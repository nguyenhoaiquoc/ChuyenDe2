import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConditionService } from './condition.service';

@Controller('conditions')
export class ConditionController {
  constructor(private readonly conditionService: ConditionService) { }

  @Get()
  findAll() {
    return this.conditionService.findAll();
  }

  @Post()
  async createMany(@Body() names: string[]) {
    return this.conditionService.createMany(names);
  }
}
