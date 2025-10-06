import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/entities/product.entity";
import { Repository } from "typeorm";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    async create(data: Partial<Product>) {
        const product = this.productRepo.create(data)
        return await this.productRepo.save(product)
    }

    // Hàm hiển thị sản phẩm
    async findAll(): Promise<Product[]> {
        return await this.productRepo.find();
    }

}