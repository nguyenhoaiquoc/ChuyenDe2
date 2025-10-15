import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Condition } from 'src/entities/condition.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConditionService {
  constructor(
    @InjectRepository(Condition)
    private readonly conditionRepo: Repository<Condition>,
  ) { }

  async findAll() {
    return this.conditionRepo.find();
  }

  async createMany(names: string[]) {
    const results: Condition[] = [];

    for (const name of names) {
      const existing = await this.conditionRepo.findOne({ where: { name } });
      if (existing) {
        results.push(existing);
      } else {
        const newCondition = this.conditionRepo.create({ name });
        const saved = await this.conditionRepo.save(newCondition);
        results.push(saved);
      }
    }

    return results;
  }
}
