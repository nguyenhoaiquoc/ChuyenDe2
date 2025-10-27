import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers = new Map<number, Socket>(); // userId -> socket

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) return client.disconnect();
      const decoded = this.jwtService.verify(token);
      const userId = Number(decoded.sub || decoded.id);
      client.data.userId = userId;
      this.onlineUsers.set(userId, client);
      console.log(`✅ User ${userId} connected`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    this.onlineUsers.delete(userId);
    console.log(`❌ User ${userId} disconnected`);
  }

  /** Khi gửi tin nhắn */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
data: { room_id: number; receiver_id: number; content: string; product_id?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    const { room_id, receiver_id, content, product_id } = data;

    const msg = await this.chatService.sendMessage(
      room_id,
      senderId,
      receiver_id,
      content,
      product_id,
    );

    // gửi tin tới người nhận nếu online
    const receiverSocket = this.onlineUsers.get(receiver_id);
    if (receiverSocket) receiverSocket.emit('receiveMessage', msg);

    // gửi ack lại cho người gửi
    client.emit('receiveMessage', msg);
  }

  /** Khi sửa tin nhắn */
  @SubscribeMessage('editMessage')
  async handleEditMessage(
    @MessageBody() data: { message_id: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const updated = await this.chatService.editMessage(userId, data.message_id, data.content);
    // broadcast cho cả 2 user
    client.emit('messageEdited', updated);
    for (const [uid, socket] of this.onlineUsers.entries()) {
      if (uid !== userId) socket.emit('messageEdited', updated);
    }
  }

  /** Khi client yêu cầu load lịch sử */
  @SubscribeMessage('getMessagesByRoom')
async handleGetMessagesByRoom(
  @MessageBody() data: { roomId: number },
  @ConnectedSocket() client: Socket,
) {
  const msgs = await this.chatService.getHistory(data.roomId, client.data.userId);
  client.emit('loadMessages', msgs);
}

}
