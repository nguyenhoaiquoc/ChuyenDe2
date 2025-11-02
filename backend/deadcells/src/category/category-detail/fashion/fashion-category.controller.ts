import { Controller, Get, Post, Body } from '@nestjs/common';
import { FashionCategoryService } from './fashion-category.service';

@Controller('fashion-categories')
export class FashionCategoryController {
    constructor(private readonly service: FashionCategoryService) { }

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
