// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { Message } from 'src/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'changeme' }), // hoặc import AuthModule
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
