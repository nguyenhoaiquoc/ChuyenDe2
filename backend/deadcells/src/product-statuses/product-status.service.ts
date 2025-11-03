import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductStatus } from 'src/entities/product-status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductStatusService {
  constructor(
    @InjectRepository(ProductStatus)
    private readonly productStatusRepo: Repository<ProductStatus>,
  ) {}

  findAll() {
    return this.productStatusRepo.find();
  }

  findOne(id: number) {
    return this.productStatusRepo.findOneBy({ id });
  }
}
