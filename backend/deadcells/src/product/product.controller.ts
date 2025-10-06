import { Body, Controller, Get, Post } from "@nestjs/common";
import { ProductService } from "./product.service";
import { Product } from "src/entities/product.entity";

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    async create(@Body() body: Partial<Product>) {
        return await this.productService.create(body);
    }

    @Get()
    findAll() {
        console.log("Đang gọi GET /products");
        return this.productService.findAll();
    }


}