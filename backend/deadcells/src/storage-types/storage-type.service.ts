import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StorageType } from 'src/entities/storage-type.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class StorageTypeService {
  constructor(
    @InjectRepository(StorageType)
    private readonly storageTypeRepo: Repository<StorageType>,
  ) {}

  async findAll(): Promise<StorageType[]> {
    return await this.storageTypeRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<StorageType | null> {
    return await this.storageTypeRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<StorageType[]> {
    return await this.storageTypeRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<StorageType[]> {
    return await this.storageTypeRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}