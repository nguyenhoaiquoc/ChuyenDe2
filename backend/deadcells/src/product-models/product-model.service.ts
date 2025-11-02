import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductModel } from 'src/entities/product-model.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductModelService {
  constructor(
    @InjectRepository(ProductModel)
    private readonly modelRepo: Repository<ProductModel>,
  ) {}

  async findByBrand(brandId: number): Promise<ProductModel[]> {
    return await this.modelRepo.find({
      where: { brand: { id: brandId } },
      relations: ['brand'],
      order: { name: 'ASC' },
    });
  }
  async findOne(id: number): Promise<ProductModel> {
    const model = await this.modelRepo.findOne({
      where: { id },
      relations: ['brand'],
    });

    if (!model) {
      throw new NotFoundException(`Không tìm thấy model với ID = ${id}`);
    }

    return model;
  }
}
