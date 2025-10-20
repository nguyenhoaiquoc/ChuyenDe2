import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from 'src/entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) {}

  async create(data: Partial<Report>) {
    const report = this.reportRepo.create(data);
    return await this.reportRepo.save(report);
  }

  async findAll() {
    return await this.reportRepo.find({ relations: ['product', 'reporter'] });
  }
}
