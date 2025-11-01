import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EngineCapacity } from 'src/entities/engine-capacity.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class EngineCapacityService {
  constructor(
    @InjectRepository(EngineCapacity)
    private readonly repo: Repository<EngineCapacity>,
  ) {}

  async findAll(): Promise<EngineCapacity[]> {
    return await this.repo.find({ relations: ['subCategory'] });
  }

  async findOne(id: number): Promise<EngineCapacity | null> {
    return await this.repo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<EngineCapacity[]> {
    return await this.repo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<EngineCapacity[]> {
    return await this.repo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}