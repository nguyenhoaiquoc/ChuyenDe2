import { Controller, Get, Post, Body } from '@nestjs/common';
import { ElectronicCategoryService } from './electronic-category.service';

@Controller('electronic-categories')
export class ElectronicCategoryController {
  constructor(private readonly service: ElectronicCategoryService) { }

  @Get()
  async getAll() {
    return this.service.findAll();
  }

  @Post()
  async createMany(@Body() body: { name: string }[]) {
    console.log(' Received body:', body);
    return this.service.createMany(body);
  }

}
