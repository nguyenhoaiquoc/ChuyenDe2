import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnimalCategory } from 'src/entities/categories/animal-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnimalCategoryService {
  constructor(
    @InjectRepository(AnimalCategory)
    private readonly repo: Repository<AnimalCategory>,
  ) { }

  async findAll(): Promise<AnimalCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
