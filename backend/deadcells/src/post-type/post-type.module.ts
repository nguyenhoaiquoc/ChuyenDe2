import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostType } from '../entities/post-type.entity';
import { PostTypeController } from './post-type.controller';
import { PostTypeService } from './post-type.service';

@Module({
    imports: [TypeOrmModule.forFeature([PostType])],
    controllers: [PostTypeController],
    providers: [PostTypeService],
    exports: [PostTypeService],
})
export class PostTypeModule { }