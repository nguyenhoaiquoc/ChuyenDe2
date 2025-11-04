import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/entities/material.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class MaterialService { 
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,
  ) {}

  async findAll(): Promise<Material[]> {
    return await this.materialRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Material | null> {
    return await this.materialRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Material[]> {
    return await this.materialRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Material[]> {
    return await this.materialRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}