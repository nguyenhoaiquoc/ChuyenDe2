import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gender } from 'src/entities/gender.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class GenderService {
  constructor(
    @InjectRepository(Gender)
    private readonly genderRepo: Repository<Gender>,
  ) {}

  async findAll(): Promise<Gender[]> {
    return await this.genderRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Gender | null> {
    return await this.genderRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Gender[]> {
    return await this.genderRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Gender[]> {
    return await this.genderRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}