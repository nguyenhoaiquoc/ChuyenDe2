import { Controller, Get, Param } from '@nestjs/common';
import { ProductModelService } from './product-model.service'; 

@Controller('product-models') 
export class ProductModelController {
  constructor(private readonly modelService: ProductModelService) {} 

  @Get('by-brand/:brandId') 
  async getByBrand(@Param('brandId') brandId: number) {
    return this.modelService.findByBrand(brandId);
  }
}