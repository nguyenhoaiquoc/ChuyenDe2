import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOne(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User không tồn tại');
    return user;
  }

  // Lấy danh sách user đang chờ duyệt CCCD
  async getPendingUsers() {
    return this.userRepo.find({
      where: { cccd_pending_data: Not(IsNull()) },
      select: ['id', 'fullName', 'cccd_pending_data'],
    });
  }

  // Duyệt CCCD pending
  async approveCCCDPending(userId: number) {
    const user = await this.findOne(userId);
    if (!user.cccd_pending_data)
      throw new BadRequestException('User không có CCCD pending');

    // Cập nhật trạng thái verified
    user.is_cccd_verified = true;
    user.verifiedAt = new Date();

    // Có thể copy dữ liệu từ pending sang user chính
    const pending = user.cccd_pending_data;
    if (pending.fullName) user.fullName = pending.fullName;
    if (pending.citizenId) user.citizenId = pending.citizenId;
    if (pending.gender) user.gender = pending.gender;
    if (pending.dob) user.dob = new Date(pending.dob);
    if (pending.hometown) user.hometown = pending.hometown;
    if (pending.address) user.address_json = pending.address;
    if (pending.imageUrl) user.image = pending.imageUrl;

    // Xoá pending
    user.cccd_pending_data = null;

    return this.userRepo.save(user);
  }

  // Từ chối CCCD pending
  async rejectCCCDPending(userId: number) {
    const user = await this.findOne(userId);
    if (!user.cccd_pending_data)
      throw new BadRequestException('User không có CCCD pending');

    // Xoá file ảnh nếu có
    const imagePath = user.cccd_pending_data?.imageUrl;
    if (imagePath) {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(__dirname, '..', '..', imagePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    // Xoá pending
    user.cccd_pending_data = null;
    return this.userRepo.save(user);
  }
}
