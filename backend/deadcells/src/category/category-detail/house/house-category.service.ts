import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HouseCategory } from 'src/entities/categories/house-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HouseCategoryService {
  constructor(
    @InjectRepository(HouseCategory)
    private readonly repo: Repository<HouseCategory>,
  ) { }

  async findAll(): Promise<HouseCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
