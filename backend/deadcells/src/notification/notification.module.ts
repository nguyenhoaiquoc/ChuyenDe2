// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { NotificationAction } from 'src/entities/notification-action.entity';
import { TargetType } from 'src/entities/target-type.entity';
import { User } from 'src/entities/user.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { GroupMember } from 'src/entities/group-member.entity';
import { NotificationActionSeedService } from './seed/notification-action.seed';
import { TargetTypeSeedService } from './seed/target-type.seed';
import { Follower } from 'src/entities/follower.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationAction,
      TargetType,
      User,
      GroupMember,
      Follower,
    ]),
  ],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationActionSeedService,
    TargetTypeSeedService,
  ],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
