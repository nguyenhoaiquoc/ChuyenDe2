import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe, 
  Query,
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
}