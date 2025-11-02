import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FashionCategory } from 'src/entities/categories/fashion-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FashionCategoryService {
  constructor(
    @InjectRepository(FashionCategory)
    private readonly repo: Repository<FashionCategory>,
  ) { }

  async findAll(): Promise<FashionCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
