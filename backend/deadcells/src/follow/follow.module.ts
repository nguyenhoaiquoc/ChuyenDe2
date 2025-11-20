import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowController } from './follow.controller';
import { NotificationModule } from 'src/notification/notification.module';
import { FollowService } from './follow.service';
import { Follower } from 'src/entities/follower.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follower]), 
    NotificationModule, 
  ],
  providers: [FollowService],
  controllers: [FollowController],
})
export class FollowModule {}