import { Controller, Get, Post, Body } from '@nestjs/common';
import { AnimalCategoryService } from './animal-category.service';

@Controller('animal-categories')
export class AnimalCategoryController {
    constructor(private readonly service: AnimalCategoryService) { }

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
