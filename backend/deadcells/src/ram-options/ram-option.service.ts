import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RamOption } from 'src/entities/ram-option.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class RamOptionService {
  constructor(
    @InjectRepository(RamOption)
    private readonly ramOptionRepo: Repository<RamOption>,
  ) {}

  async findAll(): Promise<RamOption[]> {
    return await this.ramOptionRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<RamOption | null> {
    return await this.ramOptionRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<RamOption[]> {
    return await this.ramOptionRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<RamOption[]> {
    return await this.ramOptionRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}