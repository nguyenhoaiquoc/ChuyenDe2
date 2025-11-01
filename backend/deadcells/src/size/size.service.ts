import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Size } from 'src/entities/size.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size) 
    private readonly sizeRepo: Repository<Size>,
  ) {}

  async findAll(): Promise<Size[]> {
    return await this.sizeRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Size | null> {
    return await this.sizeRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Size[]> {
    return await this.sizeRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Size[]> {
    return await this.sizeRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}