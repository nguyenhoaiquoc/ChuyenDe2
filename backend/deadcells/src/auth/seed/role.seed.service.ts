import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async onModuleInit() {
    const defaultRoles = [
      { name: 'admin', description: 'Quản trị hệ thống' },
      { name: 'user', description: 'Người dùng thông thường' },
    ];

    for (const role of defaultRoles) {
      const exists = await this.roleRepo.findOne({ where: { name: role.name } });
      if (!exists) {
        await this.roleRepo.save(role);
        console.log(`✅ Seeded role: ${role.name}`);
      }
    }
  }
}
