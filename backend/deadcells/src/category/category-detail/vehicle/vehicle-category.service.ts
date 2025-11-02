import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VehicleCategory } from 'src/entities/categories/vehicle-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VehicleCategoryService {
  constructor(
    @InjectRepository(VehicleCategory)
    private readonly repo: Repository<VehicleCategory>,
  ) { }

  async findAll(): Promise<VehicleCategory[]> {
    return this.repo.find();
  }

  async createMany(categories: { name: string }[]) {
    const newCategories = categories.map(c => this.repo.create({ name: c.name }));
    return this.repo.save(newCategories);
  }
}
