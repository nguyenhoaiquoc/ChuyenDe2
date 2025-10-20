import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProductType } from "src/entities/product_types.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProductTypeService {
    constructor(
        @InjectRepository(ProductType)
        private readonly productTypeRepo: Repository<ProductType>,
    ) { }

    async findAll(): Promise<ProductType[]> {
        return await this.productTypeRepo.find();
    }

    async findOne(id: number): Promise<ProductType | null> {
        return await this.productTypeRepo.findOne({ where: { id } });
    }

    
}