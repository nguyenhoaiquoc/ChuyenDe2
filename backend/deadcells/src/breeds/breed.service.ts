import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Breed } from 'src/entities/breed.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class BreedService {
  constructor(
    @InjectRepository(Breed)
    private readonly breedRepo: Repository<Breed>,
  ) {}

  async findAll(): Promise<Breed[]> {
    return await this.breedRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Breed | null> {
    return await this.breedRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Breed[]> {
    return await this.breedRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Breed[]> {
    return await this.breedRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}