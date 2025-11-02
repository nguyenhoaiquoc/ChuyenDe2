import { Controller, Get, Post, Body } from '@nestjs/common';
import { VehicleCategoryService } from './vehicle-category.service';

@Controller('vehicle-categories')
export class VehicleCategoryController {
    constructor(private readonly service: VehicleCategoryService) { }

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
