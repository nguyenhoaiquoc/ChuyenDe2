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
  pingInterval: 5000,  // gửi ping mỗi 5s
  pingTimeout: 10000,  // nếu không phản hồi 10s -> disconnect
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  // userId -> set of socketIds
  private socketsByUser = new Map<number, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /** Khi user kết nối socket */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
      console.log('⚠️ Không có token trong handshake');
      return client.disconnect();
    }

      const decoded = this.jwtService.verify(token);
      const userId = Number(decoded.sub || decoded.id);
      client.data.userId = userId;
          console.log(`✅ [Connect] User ${userId}, socketId=${client.id}`);

      const userSockets = this.socketsByUser.get(userId) ?? new Set<string>();
      const wasOffline = userSockets.size === 0;

      userSockets.add(client.id);
      this.socketsByUser.set(userId, userSockets);

      if (wasOffline) {
        await this.userRepo.update(userId, { lastOnlineAt: new Date() });
        this.server.emit('userOnline', { userId, online: true });
        console.log(`🟢 User ${userId} online`);
      }
    } catch (err) {
      console.log('❌ Token invalid:', err.message);
      client.disconnect();
    }
  }

  /** Khi user ngắt kết nối */
 async handleDisconnect(client: Socket) {
  const userId = client.data.userId;
  console.log("🔥 Xử lý ngắt kết nối cho userId:", userId);  // Log userId để kiểm tra

  if (!userId) return;

  const userSockets = this.socketsByUser.get(userId);
  if (!userSockets) return;

  userSockets.delete(client.id);

  // Nếu còn socket khác => vẫn online
  if (userSockets.size > 0) {
    this.socketsByUser.set(userId, userSockets);
    return;
  }

  // Nếu hết socket => thực sự offline
  this.socketsByUser.delete(userId);
  await this.userRepo.update(userId, { lastOnlineAt: new Date() });
  this.server.emit('userOnline', { userId, online: false });
  console.log(`⚫ User ${userId} offline`);
}

  getOnlineUsers() {
    return this.socketsByUser;
  }

  /** Gửi tin nhắn */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { room_id: number; receiver_id: number; content: string; product_id?: number,    media_url?: string; // 👈 thêm dòng này
 },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    const msg = await this.chatService.sendMessage(
      Number(data.room_id),
      Number(senderId),
      Number(data.receiver_id),
      data.content,
      data.product_id ? Number(data.product_id) : undefined,
          data.media_url || null, // 👈 truyền media_url vào

    );

    const receiverSockets = this.socketsByUser.get(Number(data.receiver_id));
    if (receiverSockets && receiverSockets.size > 0) {
      for (const sid of receiverSockets) {
        const sock = this.server.sockets.sockets.get(sid);
        sock?.emit('receiveMessage', msg);
      }

      const unread = await this.chatService.countUnreadMessages(Number(data.receiver_id));
      for (const sid of receiverSockets) {
        const sock = this.server.sockets.sockets.get(sid);
        sock?.emit('unreadCount', { count: unread });
      }
    }
  }

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

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { roomId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatService.markRead(Number(data.roomId), Number(data.userId));
    const unread = await this.chatService.countUnreadMessages(Number(data.userId));
    client.emit('unreadCount', { count: unread });
  }

  /** Khi user bấm đăng xuất chủ động */
 @SubscribeMessage('logout')
async handleLogout(@ConnectedSocket() client: Socket) {
  console.log("⚠️ Đang xử lý sự kiện logout");
  await this.handleDisconnect(client);
  client.disconnect(true);  // Ngắt kết nối socket
  console.log("✅ Đã ngắt kết nối socket");
}

}
  