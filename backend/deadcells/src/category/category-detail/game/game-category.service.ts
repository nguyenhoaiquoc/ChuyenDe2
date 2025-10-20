import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameCategory } from 'src/entities/categories/game-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GameCategoryService {
  constructor(
    @InjectRepository(GameCategory)
    private readonly repo: Repository<GameCategory>,
  ) { }

  async findAll(): Promise<GameCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
