import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DealType } from 'src/entities/deal-type.entity';

@Injectable()
export class DealTypeService {
  constructor(
    @InjectRepository(DealType)
    private readonly dealTypeRepo: Repository<DealType>,
  ) { }

  async findAll() {
    return this.dealTypeRepo.find();
  }

  async createMany(names: string[]) {
    const results: DealType[] = [];

    for (const name of names) {
      const existing = await this.dealTypeRepo.findOne({ where: { name } });
      if (existing) {
        results.push(existing);
      } else {
        const newDeal = this.dealTypeRepo.create({ name });
        const saved = await this.dealTypeRepo.save(newDeal);
        results.push(saved);
      }
    }

    return results;
  }
}
