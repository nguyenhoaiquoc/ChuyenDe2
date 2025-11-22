import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { baseUrl } from 'config';

@WebSocketGateway({
  cors: { origin: baseUrl },
  pingInterval: 5000,
  pingTimeout: 10000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // userId -> set of socketIds
  private socketsByUser = new Map<number, Set<string>>();
  // userId -> roomId đang mở
  private userCurrentRoom = new Map<number, number>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ========= Helpers =========
// userId -> socketIds

private async broadcastUnread(userId: number) {
  const totalUnread = await this.chatService.countUnreadMessages(userId);
  console.log(`[pushUnreadCount] user=${userId} total=${totalUnread}`);

  const sockets = this.socketsByUser.get(userId) ?? new Set<string>();
  for (const sid of sockets) {
    const sock = this.server.sockets.sockets.get(sid);
    if (sock) {
      sock.emit('unreadCount', { count: totalUnread });
    }
  }
}

  private addSocketForUser(userId: number, socketId: string) {
    const set = this.socketsByUser.get(userId) ?? new Set<string>();
    set.add(socketId);
    this.socketsByUser.set(userId, set);
  }

  private removeSocketForUser(userId: number, socketId: string) {
    const set = this.socketsByUser.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) {
      this.socketsByUser.delete(userId);
    } else {
      this.socketsByUser.set(userId, set);
    }
  }

  private async pushUnreadCount(userId: number) {
    const total = await this.chatService.countUnreadMessages(userId);
    console.log(`[pushUnreadCount] user=${userId} total=${total}`);
    // 👉 bắn cho tất cả socket của user thông qua room "user:userId"
    this.server.to(`user:${userId}`).emit('unreadCount', { count: total });
  }

  // ========= Kết nối / ngắt kết nối =========

  async handleConnection(client: Socket) {
    try {
      // Lấy token từ auth hoặc header
      const tokenFromAuth = client.handshake.auth?.token as string | undefined;
      const authHeader = client.handshake.headers['authorization'] as
        | string
        | undefined;

      const rawToken =
        tokenFromAuth ||
        (authHeader?.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : undefined);

      if (!rawToken) {
        console.log('⚠️ Không có token trong handshake');
        return client.disconnect();
      }

      const decoded: any = this.jwtService.verify(rawToken);
      const userId = Number(decoded.sub || decoded.id);
      if (!userId || Number.isNaN(userId)) {
        console.log('⚠️ Token không chứa userId hợp lệ');
        return client.disconnect();
      }

      client.data.userId = userId;

      // Join room theo user để push unread / notify
      client.join(`user:${userId}`);

      // Quản lý online / offline
      const beforeSet = this.socketsByUser.get(userId);
      const wasOffline = !beforeSet || beforeSet.size === 0;

      this.addSocketForUser(userId, client.id);

      console.log(
        `✅ [Connect] User ${userId}, socketId=${client.id}, totalSockets=${this.socketsByUser.get(
          userId,
        )?.size}`,
      );

      if (wasOffline) {
        await this.userRepo.update(userId, { lastOnlineAt: new Date() });
        this.server.emit('userOnline', { userId, online: true });
        console.log(`🟢 User ${userId} online`);
      }

      // Gửi tổng unread lúc mới connect
      await this.pushUnreadCount(userId);
    } catch (err: any) {
      console.log('❌ Token invalid:', err?.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    console.log('🔥 Xử lý ngắt kết nối cho userId:', userId);

    if (!userId) return;

    this.removeSocketForUser(userId, client.id);

    const still = this.socketsByUser.get(userId);
    if (still && still.size > 0) {
      // vẫn còn socket khác => vẫn online
      return;
    }

    // Hết socket => offline
    await this.userRepo.update(userId, { lastOnlineAt: new Date() });
    this.server.emit('userOnline', { userId, online: false });
    console.log(`⚫ User ${userId} offline`);
  }

  getOnlineUsers() {
    return this.socketsByUser;
  }

  // ========= GỬI TIN NHẮN =========

  @SubscribeMessage('sendMessage')
async handleSendMessage(
  @MessageBody() data: {
    room_id: number;
    receiver_id?: number;
    content: string;
    product_id?: number;
    media_url?: string;
  },
  @ConnectedSocket() client: Socket,
) {
  const senderId = client.data.userId;
  if (!senderId) return;

  const roomId = Number(data.room_id);

  // 1. Tạo tin nhắn
  const msg = await this.chatService.sendMessage(
    roomId,
    senderId,
    data.receiver_id ?? null,
    data.content,
    data.product_id,
    data.media_url ?? null,
  );

  // 2. Sender join room (nếu chưa)
  client.join(`room_${roomId}`);

  // 3. Gửi tin nhắn realtime cho mọi người trong phòng
  this.server.to(`room_${roomId}`).emit('receiveMessage', msg);

  // 4. Lấy danh sách người nhận (chỉ cần user_id là đủ)
  const room = await this.chatService.roomRepo.findOne({
    where: { id: roomId },
    relations: ['participants'],
  });

  if (!room) return { event: 'messageSent', data: msg };

  // FIX CHÍNH: lấy đúng user_id (trước đây bạn dùng p.user_id sai kiểu)
  const recipientIds = room.participants
    .map(p => Number(p.user_id))
    .filter(id => id && id !== senderId);

  // 5. Với mỗi người nhận
  for (const userId of recipientIds) {
    // QUAN TRỌNG NHẤT: Nếu user này có ít nhất 1 socket đang join room → đang mở phòng → ĐÁNH DẤU ĐÃ ĐỌC NGAY
    const userSockets = this.socketsByUser.get(userId) || new Set<string>();
    let isInThisRoom = false;

    for (const socketId of userSockets) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket?.rooms.has(`room_${roomId}`)) {
        isInThisRoom = true;
        break;
      }
    }

    // Nếu đang mở phòng → mark read luôn, không chờ gì nữa
    if (isInThisRoom) {
      await this.chatService.markRead(roomId, userId);
    }

    // Đảm bảo người kia nhận được tin (dù chưa join room)
    this.server.to(`user:${userId}`).emit('receiveMessage', msg);

    // Cập nhật badge chính xác nhất có thể
    await this.pushUnreadCount(userId);
  }

  return { event: 'messageSent', data: msg };
}
  // ========= Lấy history theo room =========
  @SubscribeMessage('getMessagesByRoom')
  async handleGetMessagesByRoom(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const msgs = await this.chatService.getHistory(
      Number(data.roomId),
      Number(client.data.userId),
    );
    client.emit('loadMessages', msgs);
  }

  // ========= ĐÁNH DẤU ĐÃ ĐỌC =========
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      console.log('❌ markAsRead: userId undefined', data);
      return;
    }

    const roomId = Number(data.roomId);

    await this.chatService.markRead(roomId, userId);

    // Cập nhật badge cho toàn bộ socket của user
    await this.pushUnreadCount(userId);

    console.log(
      `✅ markAsRead user=${userId}, room=${roomId} (đã emit unreadCount)`,
    );
  }

  // ========= ĐĂNG XUẤT =========
  @SubscribeMessage('logout')
  async handleLogout(@ConnectedSocket() client: Socket) {
    console.log('⚠️ Đang xử lý sự kiện logout');
    await this.handleDisconnect(client);
    client.disconnect(true);
    console.log('✅ Đã ngắt kết nối socket');
  }

  // ========= THU HỒI TIN NHẮN =========
  @SubscribeMessage('recallMessage')
  async handleRecallMessage(
    @MessageBody() data: { message_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    console.log('⚙️ [DEBUG recallMessage]');
    console.log('  → message_id:', data.message_id);
    console.log('  → socket.userId:', userId);

    const msg = await this.chatService['messageRepo'].findOne({
      where: { id: data.message_id },
    });
    console.log(
      '  → msg.sender_id:',
      msg?.sender_id,
      'is_recalled:',
      msg?.is_recalled,
    );

    const updated = await this.chatService.recallMessage(
      data.message_id,
      userId,
    );

    this.server
      .to(`room_${updated.conversation_id}`)
      .emit('messageRecalled', {
        id: updated.id,
        recalled_at: updated.recalled_at,
      });
  }

  // ========= TRẢ LỜI =========
  @SubscribeMessage('replyMessage')
  async handleReplyMessage(
    @MessageBody()
    data: {
      room_id: number;
      receiver_id: number;
      content: string;
      reply_to_id: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    const msg = await this.chatService.replyMessage(
      data.room_id,
      senderId,
      data.receiver_id,
      data.content,
      data.reply_to_id,
    );

    this.server.to(`room_${data.room_id}`).emit('newReply', msg);
  }

  // ========= CHỈNH SỬA =========
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { message_id: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('🧩 [DEBUG editMessage event]');
    console.log('client.data.userId =', client.data?.userId);
    console.log('data =', data);

    const senderId = client.data.userId;
    const msg = await this.chatService.editMessage(
      senderId,
      data.message_id,
      data.content,
    );

    this.server.to(`room_${msg.conversation_id}`).emit('messageEdited', msg);
  }

  // ========= JOIN / LEAVE ROOM =========
@SubscribeMessage('joinRoom')
async joinRoom(
  @MessageBody() data: { room_id: string },
  @ConnectedSocket() client: Socket,
) {
  const userId = client.data.userId;
  const roomId = Number(data.room_id);

  if (!userId || !roomId) return;

  client.join(`room_${roomId}`);

  // NGAY KHI VÀO PHÒNG = ĐÁNH DẤU ĐÃ ĐỌC + BADGE = 0
  await this.chatService.markRead(roomId, userId);
  await this.pushUnreadCount(userId);

  console.log(`User ${userId} vào phòng ${roomId} → tự động markRead + badge = 0`);
}

  @SubscribeMessage('leaveRoom')
  leaveRoom(
    @MessageBody() data: { room_id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    this.userCurrentRoom.delete(userId);
    client.leave(`room_${data.room_id}`);
    console.log('⚫ leaveRoom:', userId, 'room:', data.room_id);
  }

  // ========= SEARCH =========
  @SubscribeMessage('searchMessages')
  async handleSearchMessages(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = Number(client.data?.userId);
    if (!userId) {
      return {
        event: 'searchMessagesResult',
        data: { items: [], nextCursor: null },
      };
    }

    const { q, roomId, limit, cursor } = payload || {};
    const data = await this.chatService.searchMessages(
      userId,
      String(q ?? ''),
      {
        roomId: roomId ? Number(roomId) : undefined,
        limit: limit ? Number(limit) : undefined,
        cursor: cursor || undefined,
      },
    );

    return { event: 'searchMessagesResult', data };
  }

  // ========= GET UNREAD =========
  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      console.log('❌ getUnreadCount: userId undefined');
      return;
    }

    await this.pushUnreadCount(userId);
  }
}
