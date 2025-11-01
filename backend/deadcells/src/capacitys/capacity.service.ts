import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Capacity } from 'src/entities/capacity.entity'; 
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CapacityService { 
  constructor(
    @InjectRepository(Capacity) 
    private readonly capacityRepo: Repository<Capacity>,
  ) {}

  async findAll(): Promise<Capacity[]> {
    return await this.capacityRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Capacity | null> {
    return await this.capacityRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Capacity[]> {
    return await this.capacityRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Capacity[]> {
    return await this.capacityRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}