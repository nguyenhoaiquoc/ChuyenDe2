import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Express } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Cập nhật thông tin user + 1 ảnh avatar
  async updateUser(
    id: number,
    data: Partial<User>,
    file?: Express.Multer.File,
  ) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User không tồn tại');

    // Nếu có file upload, lưu URL vào image
    if (file) {
      user.image = file.path.startsWith('http')
        ? file.path
        : `${process.env.PATH}${file.path}`;
    }

    // Cập nhật các trường còn lại
    Object.assign(user, data);

    const updatedUser = await this.userRepo.save(user);

    return {
      id: updatedUser.id,
      name: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      image: updatedUser.image,
      updated_at: updatedUser.updatedAt,
    };
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new Error('User không tồn tại');
    return user;
  }

  async searchUsersForInvite(currentUserId: number | string, search?: string) {
    const userId = Number(currentUserId);
    if (isNaN(userId)) {
      throw new BadRequestException('User ID không hợp lệ');
    }

    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.id != :currentUserId', { currentUserId: userId })
      .andWhere('user.deleted_at IS NULL')
      .andWhere('user.role_id = :roleId', { roleId: 2 }); // chỉ lấy user

    if (search) {
      query.andWhere('unaccent(user.fullName) ILIKE unaccent(:search)', {
        search: `%${search}%`,
      });
    }

    const users = await query
      .select(['user.id', 'user.fullName', 'user.image'])
      .getMany();

    return users.map((u) => ({
      id: u.id,
      name: u.fullName,
      avatar: u.image,
    }));
  }
}
