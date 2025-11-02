import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Warranty } from 'src/entities/warranty.entity'; 
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class WarrantyService { 
  constructor(
    @InjectRepository(Warranty) 
    private readonly warrantyRepo: Repository<Warranty>, 
  ) {}

  async findAll(): Promise<Warranty[]> {
    return await this.warrantyRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Warranty | null> {
    return await this.warrantyRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Warranty[]> {
    return await this.warrantyRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Warranty[]> {
    return await this.warrantyRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}