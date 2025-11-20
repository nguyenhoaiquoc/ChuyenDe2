import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const userRepo = this.dataSource.getRepository(User);

    // Kiểm tra nếu user có id = 1 đã tồn tại chưa
    const existingUser = await userRepo.findOne({ where: { id: 1 } });
    if (existingUser) {
      console.log(' User id=1 đã tồn tại, bỏ qua seed user.');
      return;
    }

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    const newUser = userRepo.create({
      id: 1,
      roleId: 1,
      statusId: 1,
      fullName: 'Admin',
      email: 'admin@fit.tdc.edu.vn',
      passwordHash: passwordHash,
      is_verified: true,
    });

    const newUser2 = userRepo.create({
      id: 2,
      roleId: 2,
      statusId: 1,
      fullName: 'User test',
      email: 'user@fit.tdc.edu.vn',
      passwordHash: passwordHash,
      is_verified: true,
    });

    await userRepo.save(newUser);

    console.log('Seed User Admin thành công.');
  }
}
