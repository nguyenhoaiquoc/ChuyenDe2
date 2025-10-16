import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductType } from "src/entities/product_types.entity";
import { ProductTypeController } from "./product-type.controller";
import { ProductTypeService } from "./product-type.service";

@Module({
    imports: [TypeOrmModule.forFeature([ProductType])],
    controllers: [ProductTypeController],
    providers: [ProductTypeService],
    exports: [ProductTypeService]
})

export class ProductTypeModule{}