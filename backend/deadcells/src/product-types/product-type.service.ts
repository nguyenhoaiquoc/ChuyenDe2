import { Get, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductType } from 'src/entities/product_types.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ProductTypeService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepo: Repository<ProductType>,
  ) {}

  async findAll(): Promise<ProductType[]> {
    return await this.productTypeRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<ProductType | null> {
    return await this.productTypeRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<ProductType[]> {
    return await this.productTypeRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<ProductType[]> {
    return await this.productTypeRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(), 
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}
