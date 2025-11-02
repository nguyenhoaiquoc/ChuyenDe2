import { Controller, Post, Body, Get } from '@nestjs/common';
import { ReportService } from './report.service';
import { Report } from 'src/entities/report.entity';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() data: Partial<Report>) {
    return await this.reportService.create(data);
  }

  @Get()
  async findAll() {
    return await this.reportService.findAll();
  }
}
