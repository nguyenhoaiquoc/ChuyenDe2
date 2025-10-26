// src/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async saveMessage(sender_id: number, receiver_id: number, content: string, image_url?: string) {
    if (!content && !image_url) throw new Error("Tin nhắn trống");
    const msg = this.messageRepo.create({ sender_id, receiver_id, content, image_url });
    return this.messageRepo.save(msg);
  }

  async getMessagesBetween(userA: number, userB: number, limit = 100) {
    return this.messageRepo.find({
      where: [
        { sender_id: userA, receiver_id: userB },
        { sender_id: userB, receiver_id: userA },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
      take: limit,
    });
  }
  // ChatService
async getConversations(userId: number) {
  const qb = this.messageRepo
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.sender', 'sender')
    .leftJoinAndSelect('message.receiver', 'receiver')
    .where('message.sender_id = :userId OR message.receiver_id = :userId', { userId })
    .orderBy('message.created_at', 'DESC');

  const messages = await qb.getMany();

  // Lọc ra danh sách conversation duy nhất theo user khác
  const convMap = new Map<number, any>();
  for (const msg of messages) {
    const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
    if (!convMap.has(otherUser.id)) {
      convMap.set(otherUser.id, {
        otherUserId: otherUser.id,
        otherUserName: otherUser.fullName,
        otherUserAvatar: otherUser.image || '', // tùy field avatar
        lastMessage: msg.content,
        lastMessageDate: msg.created_at,
        unreadCount: 0, // có thể tính sau
      });
    }
  }

  return Array.from(convMap.values());
}

}
