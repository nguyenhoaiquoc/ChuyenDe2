import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GraphicsCard } from 'src/entities/graphics-card.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class GraphicsCardService {
  constructor(
    @InjectRepository(GraphicsCard)
    private readonly graphicsCardRepo: Repository<GraphicsCard>,
  ) {}

  async findAll(): Promise<GraphicsCard[]> {
    return await this.graphicsCardRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<GraphicsCard | null> {
    return await this.graphicsCardRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<GraphicsCard[]> {
    return await this.graphicsCardRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<GraphicsCard[]> {
    return await this.graphicsCardRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}