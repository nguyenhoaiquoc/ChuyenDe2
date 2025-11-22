// Trong report.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common'; //  THÊM Patch, Param, ParseIntPipe
import { ReportService } from './report.service';
import { Report } from 'src/entities/report.entity';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // 🟢 Tạo báo cáo mới
  @Post()
  async create(@Body() data: Partial<Report>) {
    return await this.reportService.create(data);
  }

  // 🟢 Lấy tất cả báo cáo
  @Get()
  async findAll() {
    return await this.reportService.findAll();
  }

  //  1. Lấy chi tiết 1 báo cáo
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.reportService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.reportService.remove(id);
  }

  //  2. Cập nhật trạng thái báo cáo (Admin)
  @Patch(':id/status')
  // Cần thêm AdminGuard ở đây (tôi giả định đã có)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('statusId', ParseIntPipe) statusId: number,
  ) {
    return await this.reportService.updateStatus(id, statusId);
  }

  //  3. Khóa/Mở khóa người dùng bị báo cáo (Admin)
  @Patch('user/:userId/status')
  async updateUserStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('statusId', ParseIntPipe) statusId: number,
  ) {
    return await this.reportService.updateUserStatus(userId, statusId);
  }
}
