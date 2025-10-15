import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubCategory } from 'src/entities/sub-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectRepository(SubCategory)
    private readonly subCategoryRepo: Repository<SubCategory>,
  ) { }

  async findAll() {
    return this.subCategoryRepo.find();
  }

  async findOne(id: number) {
    return this.subCategoryRepo.findOne({ where: { id } });
  }

  async findWithSource(id: number) {
    const sub = await this.subCategoryRepo.findOne({ where: { id } });
    return sub;
  }

  async create(data: Partial<SubCategory>) {
    const sub = this.subCategoryRepo.create(data);
    return this.subCategoryRepo.save(sub);
  }

  async update(id: number, data: Partial<SubCategory>) {
    await this.subCategoryRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.subCategoryRepo.delete(id);
  }

  async findByCategory(categoryId: number) {
    return this.subCategoryRepo.find({
      where: { categoryId },
      relations: ['category']
    });

  }
}
