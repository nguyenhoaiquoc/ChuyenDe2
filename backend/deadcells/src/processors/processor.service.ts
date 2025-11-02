import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Processor } from 'src/entities/processor.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ProcessorService {
  constructor(
    @InjectRepository(Processor)
    private readonly processorRepo: Repository<Processor>,
  ) {}

  async findAll(): Promise<Processor[]> {
    return await this.processorRepo.find({
      relations: ['subCategory'],
    });
  }

  async findOne(id: number): Promise<Processor | null> {
    return await this.processorRepo.findOne({
      where: { id },
      relations: ['subCategory'],
    });
  }

  async findBySubCategory(subCategoryId: number): Promise<Processor[]> {
    return await this.processorRepo.find({
      where: { subCategory: { id: subCategoryId } },
      relations: ['subCategory'],
      order: { id: 'ASC' },
    });
  }

  async findByCategory(categoryId: number): Promise<Processor[]> {
    return await this.processorRepo.find({
      where: {
        category: { id: categoryId },
        subCategory: IsNull(),
      },
      relations: ['category'],
      order: { id: 'ASC' },
    });
  }
}