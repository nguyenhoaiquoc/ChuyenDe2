// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationRoom } from 'src/entities/conversation-room.entity';
import { ConversationParticipant } from 'src/entities/conversation-participant.entity';
import { Message } from 'src/entities/message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationRoom, ConversationParticipant, Message]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, JwtAuthGuard],
  exports: [ChatService],
})
export class ChatModule {}
