import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/entities/user.entity';
import { Express } from 'express';
import { Repository } from 'typeorm';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}
  

  // Cập nhật thông tin user + 1 ảnh avatar
async updateUser(id: number, data: Partial<User>) {
  const user = await this.userRepo.findOne({ where: { id } });
  if (!user) throw new Error('User not found');

  if (data.image === "" || data.image === null) {
    user.image = null;
  }
  if (data.coverImage === "" || data.coverImage === null) {
    user.coverImage = null;
  }

  Object.assign(user, data);

  // ⚡ Đổi từ userRepository -> userRepo
  return this.userRepo.save(user);
}


  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  
 async findOne(id: number): Promise<User> {
  const user = await this.userRepo.findOne({ where: { id } });
  if (!user) throw new Error('User không tồn tại');
  return user;
}

}
