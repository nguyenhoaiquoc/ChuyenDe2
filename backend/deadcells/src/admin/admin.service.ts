import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Not, IsNull } from 'typeorm';
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Lấy danh sách user đang chờ duyệt
  async getPendingUsers() {
    return this.userRepo.find({
      where: [
        { cccd_pending_data: Not(null) },
      ],
      select: ['id', 'fullName', 'cccd_pending_data'],
    });
  }

  // Duyệt CCCD
  async approveCCCD(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy user');

    user.cccd_verified_data = user.cccd_pending_data;
    user.cccd_pending_data = null;

    return this.userRepo.save(user);
  }

  // Từ chối CCCD
  async rejectCCCD(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Không tìm thấy user');

    user.cccd_pending_data = null;

    return this.userRepo.save(user);
  }
}
