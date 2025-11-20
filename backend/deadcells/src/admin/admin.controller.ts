import { Controller, Get, Patch, Param } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 1. Lấy danh sách user đang chờ duyệt
  @Get('pending-cccd')
  getPendingUsers() {
    return this.adminService.getPendingUsers();
  }

  // 2. Admin duyệt
  @Patch('approve/:userId')
  approveCCCD(@Param('userId') userId: number) {
    return this.adminService.approveCCCD(userId);
  }

  // 3. Admin từ chối
  @Patch('reject/:userId')
  rejectCCCD(@Param('userId') userId: number) {
    return this.adminService.rejectCCCD(userId);
  }
}
