import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /** 
   * Mở hoặc tạo mới room giữa buyer và seller (từ trang sản phẩm)
   * Body: { seller_id: number, buyer_id?: number }
   * buyer_id sẽ lấy từ token nếu không gửi
   */
  @Post('room')
  async openOrCreateRoom(
    @Body() body: { seller_id: number; buyer_id?: number },
    @Req() req: Request,
  ) {
    const user = req['user'];
    const buyerId = body.buyer_id || user.id;
    if (buyerId === body.seller_id)
      throw new HttpException('Không thể tự chat với chính mình', HttpStatus.BAD_REQUEST);

    const room = await this.chatService.openOrCreateRoom(body.seller_id, buyerId);
    return { room };
  }

  /**
   * Lấy danh sách room (chatlist)
   * Tự động phân biệt user là buyer hay seller.
   * Query: ?limit=20&offset=0
   */
  @Get('list')
  async getChatList(
    @Req() req: Request,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    const userId = req['user'].id;
    const data = await this.chatService.getChatList(userId, Number(limit), Number(offset));
    return { data };
  }

  /**
   * Lấy lịch sử tin nhắn trong 1 room
   * GET /chat/history/:roomId?cursor=timestamp
   */
  @Get('history/:roomId')
  async getHistory(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
    @Query('cursor') cursor?: string,
    @Query('limit') limit = 30,
  ) {
    const userId = req['user'].id;
    const data = await this.chatService.getHistory(roomId, userId, cursor, Number(limit));
    return { data };
  }

  /**
   * Đánh dấu tin nhắn đã đọc trong 1 room
   */
  @Post('mark-read/:roomId')
  async markRead(
    @Req() req: Request,
    @Param('roomId', ParseIntPipe) roomId: number,
  ) {
    const userId = req['user'].id;
    await this.chatService.markRead(roomId, userId);
    return { success: true };
  }

  /**
   * Chỉnh sửa tin nhắn (qua HTTP nếu client chưa bật socket)
   */
  @Post('edit')
  async editMessage(
    @Req() req: Request,
    @Body() body: { message_id: number; content: string },
  ) {
    const userId = req['user'].id;
    const msg = await this.chatService.editMessage(userId, body.message_id, body.content);
    return { message: msg };
  }
}
