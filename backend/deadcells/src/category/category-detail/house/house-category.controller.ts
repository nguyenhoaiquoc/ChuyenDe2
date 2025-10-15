import { Controller, Get, Post, Body } from '@nestjs/common';
import { HouseCategoryService } from './house-category.service';

@Controller('house-categories')
export class HouseCategoryController {
    constructor(private readonly service: HouseCategoryService) { }

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
