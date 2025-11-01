import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép mọi client (app) kết nối
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // Server Socket.IO

  private logger = new Logger('NotificationGateway');

  // Quản lý các user đang kết nối (Map<userId, socketId>)
  // Tốt hơn là dùng "Rooms"
  
  handleConnection(client: Socket) {
    this.logger.log(`Client đã kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client đã ngắt kết nối: ${client.id}`);
    // (Sau này ông có thể làm logic xóa user khỏi map/room)
  }

  /**
   * Lắng nghe sự kiện 'identify' từ app
   * App sẽ gửi { userId: '123' }
   */
  @SubscribeMessage('identify')
  handleIdentify(client: Socket, payload: { userId: string | number }): void {
    if (payload.userId) {
      const userIdString = String(payload.userId);
      this.logger.log(`Client ${client.id} được định danh là user: ${userIdString}`);
      // Cho client này vào một "phòng" riêng có tên là chính userId của họ
      client.join(userIdString);
    }
  }

  /**
   * Hàm này được gọi từ Service để GỬI (push)
   * số lượng mới cho CHỈ MỘT user
   */
  sendUnreadCountToUser(userId: string | number, count: number) {
    const userIdString = String(userId);
    this.logger.log(`Đang gửi unread_count_update (${count}) cho phòng: ${userIdString}`);
    // Gửi sự kiện 'unread_count_update' cho phòng có tên userIdString
    this.server.to(userIdString).emit('unread_count_update', { count });
  }
}