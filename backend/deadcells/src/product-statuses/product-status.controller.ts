import { Controller, Get, Param } from '@nestjs/common';
import { ProductStatusService } from './product-status.service'; // <-- Đổi service

@Controller('product-statuses') // <-- Đổi đường dẫn (route)
export class ProductStatusController {
  constructor(
    private readonly productStatusService: ProductStatusService, // <-- Đổi service
  ) {}

  @Get()
  findAll() {
    return this.productStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.productStatusService.findOne(id);
  }
}