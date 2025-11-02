import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AcademicCategory } from 'src/entities/categories/academic-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AcademicCategoryService {
  constructor(
    @InjectRepository(AcademicCategory)
    private readonly repo: Repository<AcademicCategory>,
  ) { }

  async findAll(): Promise<AcademicCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
