// src/follow/follow.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follower } from 'src/entities/follower.entity';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { NotificationModule } from 'src/notification/notification.module'; // 👈 Import Noti

@Module({
  imports: [
    TypeOrmModule.forFeature([Follower]), // 👈 Import Entity
    NotificationModule, // 👈 Import Module
  ],
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule {}