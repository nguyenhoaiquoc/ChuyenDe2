import { Controller, Get, Post, Body } from '@nestjs/common';
import { GameCategoryService } from './game-category.service';

@Controller('game-categories')
export class GameCategoryController {
    constructor(private readonly service: GameCategoryService) { }

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
