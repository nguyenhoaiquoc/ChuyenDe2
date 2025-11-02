import { Controller, Get, Post, Body } from '@nestjs/common';
import { AcademicCategoryService } from './academic-category.service';

@Controller('academic-categories')
export class AcademicCategoryController {
    constructor(private readonly service: AcademicCategoryService) { }

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
