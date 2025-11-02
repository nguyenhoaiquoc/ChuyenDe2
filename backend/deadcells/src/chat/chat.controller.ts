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
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import type { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService, 
     private readonly chatGateway: ChatGateway,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** 
   * Mở hoặc tạo mới room giữa buyer và seller (từ trang sản phẩm)
   * Body: { seller_id: number, buyer_id?: number }
   * buyer_id sẽ lấy từ token nếu không gửi
   */
@Post('room')
async openOrCreateRoom(
  @Body() body: { seller_id: number; buyer_id?: number; product_id?: number },
  @Req() req: Request,
) {
  const user = req['user'];
  const buyerId = body.buyer_id || user.id;

  if (buyerId === body.seller_id)
    throw new HttpException('Không thể tự chat với chính mình', HttpStatus.BAD_REQUEST);

  const room = await this.chatService.openOrCreateRoom(
    body.seller_id,
    buyerId,
    body.product_id,      // ✅ thêm dòng này
  );
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

  @Get('online-status/:id')
  async getOnlineStatus(@Param('id') id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User không tồn tại');

    const online = this.chatGateway.getOnlineUsers().has(id);
    return {
      userId: id,
      online,
      lastOnlineAt: user.lastOnlineAt,
    };
  }
@Post('upload')
@UseGuards(OptionalJwtAuthGuard) // hoặc bỏ hẳn guard
@UseInterceptors(FileInterceptor('file', CloudinaryMulter))
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  if (!file) throw new HttpException('File not found', HttpStatus.BAD_REQUEST);
  return { url: file.path };
}

/** 🗑️ Thu hồi tin nhắn */
@Post('recall/:id')
async recallMessage(
  @Req() req: Request,
  @Param('id', ParseIntPipe) messageId: number,
) {
  const userId = req['user'].id;
  const msg = await this.chatService.recallMessage(messageId, userId);

  // 🔄 Phát socket cho room để client realtime
  this.chatGateway.server
    .to(`room_${msg.conversation_id}`)
    .emit('messageRecalled', { id: msg.id, recalled_at: msg.recalled_at });

  return { message: msg };
}

/** 🗨️ Trả lời tin nhắn (qua HTTP) */
@Post('reply')
async replyMessage(
  @Req() req: Request,
  @Body()
  body: {
    room_id: number;
    receiver_id: number;
    content: string;
    reply_to_id: number;
  },
) {
  const senderId = req['user'].id;
  const msg = await this.chatService.replyMessage(
    body.room_id,
    senderId,
    body.receiver_id,
    body.content,
    body.reply_to_id,
  );

  // 🔄 Emit realtime
  this.chatGateway.server.to(`room_${body.room_id}`).emit('newReply', msg);
  return { message: msg };
}

/** ✏️ Sửa tin nhắn (HTTP + Socket emit) */
@Post('edit/:id')
async editMessage(
  @Req() req: Request,
  @Param('id', ParseIntPipe) messageId: number,
  @Body() body: { content: string },
) {
  const userId = req['user'].id;
  const msg = await this.chatService.editMessage(userId, messageId, body.content);

  // 🔄 Thông báo cho các client khác
  this.chatGateway.server
    .to(`room_${msg.conversation_id}`)
    .emit('messageEdited', msg);

  return { message: msg };
}
/** 🔎 HTTP search tin nhắn: /chat/search?q=...&roomId=&limit=&cursor= */
@Get('search')
async searchMessagesHttp(
  @Req() req: Request,
  @Query('q') q: string,
  @Query('roomId') roomId?: string,
  @Query('limit') limit?: string,
  @Query('cursor') cursor?: string,
) {
  const userId = req['user'].id;
  const data = await this.chatService.searchMessages(userId, q, {
    roomId: roomId ? Number(roomId) : undefined,
    limit: limit ? Number(limit) : undefined,
    cursor: cursor || undefined,
  });
  return { data };
}
/** 📍 GET /chat/history/:roomId/around?messageId=...&window=40 */
@Get('history/:roomId/around')
async getHistoryAround(
  @Req() req: Request,
  @Param('roomId', ParseIntPipe) roomId: number,
  @Query('messageId', ParseIntPipe) messageId: number,
  @Query('window') window = '40',
) {
  const userId = req['user'].id;
  const data = await this.chatService.getHistoryAround(roomId, userId, messageId, Number(window));
  return { data };
}
/** 🔎 Meta của 1 room (để mở từ Search mà có đủ partner/product) */
@Get('room/:roomId/meta')
async getRoomMeta(
  @Req() req: Request,
  @Param('roomId', ParseIntPipe) roomId: number,
) {
  const userId = req['user'].id;
  const data = await this.chatService.getRoomMetaData(userId, roomId);
  if (!data) {
    // Không tồn tại hoặc không có quyền
    throw new NotFoundException('Room không tồn tại hoặc bạn không thuộc phòng này');
  }
  return { data };
}

}
