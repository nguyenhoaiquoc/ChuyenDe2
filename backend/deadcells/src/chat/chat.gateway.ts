  import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
  import { Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  import { log } from 'console';

  @WebSocketGateway({ cors: true })
  export class ChatGateway {
    private onlineUsers = new Map<number, Socket>(); // userId -> socket

    constructor(private readonly chatService: ChatService) {}

    handleConnection(client: Socket) {
      const userId = Number(client.handshake.auth.userId);
      if (userId) this.onlineUsers.set(userId, client);
    }

    handleDisconnect(client: Socket) {
      for (const [userId, socket] of this.onlineUsers.entries()) {
        if (socket.id === client.id) this.onlineUsers.delete(userId);
      }
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
      @MessageBody() data: { sender_id: number; receiver_id: number; content: string },
      @ConnectedSocket() client: Socket,
    ) {
      const savedMessage = await this.chatService.saveMessage(data.sender_id, data.receiver_id, data.content);

      // Gửi realtime tới người nhận nếu đang online
      const receiverSocket = this.onlineUsers.get(data.receiver_id);
      if (receiverSocket) receiverSocket.emit('receiveMessage', savedMessage);
      console.log('Receiver online?', !!receiverSocket); // true nếu online, false nếu offline

      
      // Gửi lại cho người gửi để UI hiển thị ngay
      client.emit('receiveMessage', savedMessage);
      return savedMessage;
    }

    @SubscribeMessage('getMessages')
    async handleGetMessages(
      @MessageBody() data: { userA: number; userB: number },
      @ConnectedSocket() client: Socket,
    ) {
      const msgs = await this.chatService.getMessagesBetween(data.userA, data.userB);
      client.emit('loadMessages', msgs);
    }
  }
