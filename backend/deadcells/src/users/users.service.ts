import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Tìm 1 user theo ID
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Người dùng với id ${id} không tồn tại`);
    }
    return user;
  }

  /**
   * ✅ HÀM CẬP NHẬT ĐÃ SỬA LỖI
   * Hàm này gán thủ công từng trường để đảm bảo mọi thứ được lưu.
   */
  async updateUser(id: number, data: any): Promise<User> { 
    // Dùng data: any để chấp nhận mọi trường từ frontend
    
    // 1. Lấy user từ DB
    const user = await this.findOne(id); // Dùng hàm findOne đã có sẵn

    // 2. Gán thủ công (Sửa lỗi 500)
    // ❌ Bỏ: Object.assign(user, data);

    // === CÁC TRƯỜNG TỪ EditProfileScreen ===
    if (data.fullName !== undefined) user.fullName = data.fullName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.address_json !== undefined) user.address_json = data.address_json;
    
    // (Frontend gửi 'citizenId', khớp với DB 'citizenId')
    if (data.citizenId !== undefined) {
      user.citizenId = data.citizenId;
    }
    
    // ✅ BỔ SUNG CÁC TRƯỜNG BỊ THIẾU MÀ BẠN PHÁT HIỆN:
    if (data.bio !== undefined) {
      user.bio = data.bio;
    }
    if (data.nickname !== undefined) {
      user.nickname = data.nickname;
    }
    if (data.gender !== undefined) {
      user.gender = data.gender; // (Frontend đã gửi 1, 2, 3)
    }
    if (data.dob !== undefined) {
      user.dob = data.dob; // (Frontend đã gửi YYYY-MM-DD)
    }
    // if (data.allowContact !== undefined) {
    //   user.allowContact = data.allowContact;
    // }

    // === CÁC TRƯỜNG TỪ UserInforScreen (Upload/Xóa ảnh) ===
    // (Dùng hasOwnProperty để nhận cả giá trị null khi xóa)
    if (data.hasOwnProperty('image')) {
      user.image = data.image; // Gán 'http://...' hoặc null
    }
    if (data.hasOwnProperty('coverImage')) {
      user.coverImage = data.coverImage; // Gán 'http://...' hoặc null
    }

    // 3. Lưu và trả về
    return this.userRepo.save(user);
  }

  /**
   * Lấy tất cả user
   */
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
}