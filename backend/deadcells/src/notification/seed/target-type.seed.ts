import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TargetType } from 'src/entities/target-type.entity';

@Injectable()
export class TargetTypeSeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const repo = this.dataSource.getRepository(TargetType);

    const types = ['product', 'user_profile', 'comment', 'group', 'message'];

    for (const name of types) {
      const exists = await repo.findOne({ where: { name } });
      if (!exists) {
        await repo.save(repo.create({ name }));
      }
    }
    console.log('Seed target_types thành công!');
  }
}
