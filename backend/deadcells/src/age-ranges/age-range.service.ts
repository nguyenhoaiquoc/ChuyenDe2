import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AgeRange } from 'src/entities/age-range.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class AgeRangeService {
  constructor(
    @InjectRepository(AgeRange)
    private readonly ageRangeRepo: Repository<AgeRange>,
  ) {}

  async findAll(): Promise<AgeRange[]> {
    return await this.ageRangeRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<AgeRange | null> {
    return await this.ageRangeRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<AgeRange[]> {
    return await this.ageRangeRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<AgeRange[]> {
    return await this.ageRangeRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}