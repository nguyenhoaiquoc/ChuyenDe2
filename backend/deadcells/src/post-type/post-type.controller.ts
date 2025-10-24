import { Controller, Get, Post, Body } from '@nestjs/common';
import { PostTypeService } from './post-type.service';
import { PostType } from '../entities/post-type.entity';

@Controller('post-types')
export class PostTypeController {
    constructor(private readonly postTypeService: PostTypeService) { }

    @Get()
    async findAll(): Promise<PostType[]> {
        return this.postTypeService.findAll();
    }

    @Post()
    async createMany(@Body() names: string[]): Promise<PostType[]> {
        return this.postTypeService.createMany(names);
    }
}