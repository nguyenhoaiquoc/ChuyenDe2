import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElectronicCategory } from 'src/entities/categories/electronic-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ElectronicCategoryService {
  constructor(
    @InjectRepository(ElectronicCategory)
    private readonly repo: Repository<ElectronicCategory>,
  ) { }

  async findAll(): Promise<ElectronicCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
