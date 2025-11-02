import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity'; 
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class BrandService { 
  constructor(
    @InjectRepository(Brand) 
    private readonly brandRepo: Repository<Brand>, 
  ) {}

  async findAll(): Promise<Brand[]> {
    return await this.brandRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Brand | null> {
    return await this.brandRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Brand[]> {
    return await this.brandRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Brand[]> {
    return await this.brandRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}