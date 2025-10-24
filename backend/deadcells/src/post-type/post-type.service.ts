import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostType } from '../entities/post-type.entity';

@Injectable()
export class PostTypeService {
    constructor(
        @InjectRepository(PostType)
        private readonly postTypeRepo: Repository<PostType>,
    ) { }

    async findAll(): Promise<PostType[]> {
        return this.postTypeRepo.find();
    }

    async createMany(names: string[]): Promise<PostType[]> {
        const results: PostType[] = [];

        for (const name of names) {
            const existing = await this.postTypeRepo.findOne({ where: { name } });
            if (existing) {
                results.push(existing);
            } else {
                const newPostType = this.postTypeRepo.create({ name });
                const saved = await this.postTypeRepo.save(newPostType);
                results.push(saved);
            }
        }

        return results;
    }
}