import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from 'src/entities/report.entity';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
  ) { }

  async create(data: any) {

    const reportEntity = this.reportRepo.create({
      reason: data.reason,

      product: { id: Number(data.product_id) },


      reporter: { id: Number(data.reporter_id) },

 
      reported_user: { id: Number(data.reported_user_id) },

      // (ví dụ: Chờ duyệt)
      status: { id: 1 },
    });

    return await this.reportRepo.save(reportEntity);
  }

  async findAll() {
    // Sửa lại relations để load cả reported_user
    return await this.reportRepo.find({
      relations: ['product', 'reporter', 'reported_user', 'status']
    });
  }
}