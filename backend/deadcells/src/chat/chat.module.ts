// src/chat/chat.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationRoom } from 'src/entities/conversation-room.entity';
import { ConversationParticipant } from 'src/entities/conversation-participant.entity';
import { Message } from 'src/entities/message.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/entities/user.entity';
import { Group } from 'src/entities/group.entity';
import { GroupMember } from 'src/entities/group-member.entity';
import { GroupModule } from 'src/groups/group.module';
import { UsersModule } from 'src/users/users.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationRoom, ConversationParticipant, Message,User,Group,GroupMember]),
  AuthModule, UsersModule,   forwardRef(() => GroupModule)],
  
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, JwtAuthGuard],
  exports: [ChatService],
})
export class ChatModule {}
