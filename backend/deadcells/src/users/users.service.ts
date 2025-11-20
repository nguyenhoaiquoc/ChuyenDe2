import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Người dùng với id ${id} không tồn tại`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.findOne(id);

    const allowedFields = [
      'fullName',
      'phone',
      'address_json',
      'hometown',
      'gender',
      'dob',
      'nickname',
      'bio',
      'is_cccd_verified',
      'verifiedAt',
      'image',
      'coverImage',
      'citizenId',
    ] as const;
    

    if (data.citizenId && data.citizenId !== user.citizenId) {
      const existingUser = await this.userRepo.findOne({
        where: { citizenId: data.citizenId },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Số CCCD này đã được đăng ký bởi người khác');
      }
    }

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        (user as any)[field] = data[field];
      }
    });

    if (data.is_cccd_verified === true && !user.is_cccd_verified) {
      user.is_cccd_verified = true;
      user.verifiedAt = new Date();
    }

    return this.userRepo.save(user);
  }

  async verifyCCCD(
    userId: number,
    cccdData: {
      fullName?: string;
      citizenId?: string;
      gender?: string;
      dob?: string;
      hometown?: string;
      address?: string;
      imageUrl?: string;
    },
  ): Promise<User> {
    console.log('CCCD DATA NHẬN VÀO:', cccdData);
    const updateData: Partial<User> = {
      is_cccd_verified: true,
      verifiedAt: new Date(),
    };

    if (cccdData.fullName) updateData.fullName = cccdData.fullName;
    if (cccdData.citizenId) updateData.citizenId = cccdData.citizenId;
    if (cccdData.gender) updateData.gender = cccdData.gender;
    if (cccdData.dob) {
  const date = new Date(cccdData.dob);
  if (!isNaN(date.getTime())) {
    updateData.dob = date;
  }
}
    if (cccdData.hometown) updateData.hometown = cccdData.hometown;
    if (cccdData.address) {
      updateData.address_json = {
        full: cccdData.address,
        source: 'cccd_scan',
        updatedAt: new Date().toISOString(),
      };
    }

    if (cccdData.imageUrl) {
      updateData.image = cccdData.imageUrl;
    }
      console.log(updateData);
      
    return this.updateUser(userId, updateData);
  }
}