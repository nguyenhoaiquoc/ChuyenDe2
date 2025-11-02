import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from 'src/entities/color.entity'; 
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ColorService { 
  constructor(
    @InjectRepository(Color) 
    private readonly colorRepo: Repository<Color>,  
  ) {}

  async findAll(): Promise<Color[]> {
    return await this.colorRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Color | null> {
    return await this.colorRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Color[]> {
    return await this.colorRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Color[]> {
    return await this.colorRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}