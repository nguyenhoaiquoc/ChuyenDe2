import { Get, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Origin } from 'src/entities/origin.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class OriginService {
  constructor(
    @InjectRepository(Origin)
    private readonly originRepo: Repository<Origin>,
  ) {}

  async findAll(): Promise<Origin[]> {
    return await this.originRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Origin | null> {
    return await this.originRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Origin[]> {
    return await this.originRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Origin[]> {
    return await this.originRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(), 
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}
