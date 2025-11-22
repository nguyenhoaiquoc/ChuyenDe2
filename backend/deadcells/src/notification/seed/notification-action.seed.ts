import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { NotificationAction } from 'src/entities/notification-action.entity';

@Injectable()
export class NotificationActionSeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    const repo = this.dataSource.getRepository(NotificationAction);

    const actions = [
      'group_invitation',
      'post_success',
      'favorite_product',
      'favorite_confirmation',
      'admin_new_post',
      'new_follow',
      'following_new_post',
      'comment',
      'message',
      'report',
    ];

    for (const name of actions) {
      const exists = await repo.findOne({ where: { name } });
      if (!exists) {
        await repo.save(repo.create({ name }));
      }
    }

    console.log('Seed notification_actions thành công!');
  }
}
