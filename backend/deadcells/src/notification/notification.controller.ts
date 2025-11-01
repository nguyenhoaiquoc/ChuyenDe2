import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe, 
  Query,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user/:userId') 
  async getMyNotifications(
    @Param('userId', ParseIntPipe) userId: number, 
    @Query('tab') tab: string,
  ) {

    return this.notificationService.getNotificationsForUser(userId);
  }

 
  @Patch(':id/read/user/:userId') 
  async markAsRead(

    @Param('id', ParseIntPipe) notificationId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
   
    return this.notificationService.markAsRead(notificationId, userId);
  }

  @Delete('user/:userId')
  async deleteAll(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.deleteAllForUser(userId);
  }

  @Patch('user/:userId/mark-all-read')
  @HttpCode(HttpStatus.OK) // Trả về 200
  async markAllAsRead(  
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.markAllAsRead(userId);
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.notificationService.getUnreadCount(userId);
  }
}