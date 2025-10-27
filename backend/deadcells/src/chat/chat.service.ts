import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationRoom } from 'src/entities/conversation-room.entity';
import { ConversationParticipant } from 'src/entities/conversation-participant.entity';
import { Message } from 'src/entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationRoom)
    private readonly roomRepo: Repository<ConversationRoom>,
    @InjectRepository(ConversationParticipant)
    private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /** Tạo hoặc lấy room giữa buyer và seller */
  async openOrCreateRoom(sellerId: number, buyerId: number) {
    let room = await this.roomRepo.findOne({
      where: { seller_id: String(sellerId), buyer_id: String(buyerId), room_type: 'PAIR' },
    });

    if (!room) {
      room = this.roomRepo.create({
        seller_id: String(sellerId),
        buyer_id: String(buyerId),
        room_type: 'PAIR',
      });
      await this.roomRepo.save(room);

      // Tạo participants
      await this.partRepo.insert([
        { conversation_id: room.id, user_id: String(sellerId), role: 'SELLER' },
        { conversation_id: room.id, user_id: String(buyerId), role: 'BUYER' },
      ]);
    }

    return room;
  }

  /** Gửi tin nhắn (text hoặc media) */
  async sendMessage(
    conversationId: number,
    senderId: number,
    receiverId: number,
    content: string,
    productId?: number,
    mediaUrl?: string,
  ) {
    const msg = this.messageRepo.create({
      conversation_id: String(conversationId),
      sender_id: String(senderId),
      receiver_id: String(receiverId),
      product_id: productId ? String(productId) : null,
      content,
      media_url: mediaUrl ?? null,
      message_type: mediaUrl ? 'IMAGE' : 'TEXT',
    });

    const saved = await this.messageRepo.save(msg);

    // Cập nhật room
    await this.roomRepo.update(conversationId, {
      last_message_id: saved.id,
      last_message_at: saved.created_at,
  last_product_id: productId != null ? String(productId) : null, // ✅ ép kiểu
    });

    return saved;
  }

  /** Lấy lịch sử tin nhắn giữa 2 user */
  async getMessagesBetween(userA: number, userB: number, limit = 50) {
    return this.messageRepo.find({
      where: [
        { sender_id: String(userA), receiver_id: String(userB) },
        { sender_id: String(userB), receiver_id: String(userA) },
      ],
      relations: ['sender', 'receiver'],
      order: { created_at: 'ASC' },
      take: limit,
    });
  }

  /** Sửa tin nhắn */
  async editMessage(userId: number, messageId: number, newContent: string) {
    const msg = await this.messageRepo.findOne({ where: { id: String(messageId) } });
    if (!msg) throw new Error('Không tìm thấy tin nhắn');
    if (msg.sender_id !== String(userId)) throw new Error('Bạn không thể sửa tin này');

    msg.content = newContent;
    msg.is_edited = true;
    msg.edit_count = (msg.edit_count ?? 0) + 1;
    msg.edited_at = new Date();

    return this.messageRepo.save(msg);
  }

  /** Đánh dấu đã đọc */
  async markRead(conversationId: number, userId: number) {
    await this.partRepo.update(
      { conversation_id: String(conversationId), user_id: String(userId) },
      { last_read_at: new Date() },
    );
  }
  /** Lấy danh sách các cuộc chat (chatlist) của 1 user */
async getChatList(userId: number, limit = 20, offset = 0) {
  const qb = this.roomRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.seller', 'seller')
    .leftJoinAndSelect('r.buyer', 'buyer')
    .leftJoinAndSelect('r.last_message', 'm')
    .leftJoinAndSelect('r.last_product', 'p')
    .where('r.seller_id = :uid OR r.buyer_id = :uid', { uid: userId })
    .orderBy('r.last_message_at', 'DESC')
    .limit(limit)
    .offset(offset);

  const rooms = await qb.getMany();

  return rooms.map((r) => ({
    room_id: r.id,
    last_message: r.last_message?.content || '',
    last_message_at: r.last_message_at,
    product: r.last_product ? { id: r.last_product.id, name: r.last_product['name'] } : null,
    partner:
      String(r.seller_id) === String(userId)
        ? { id: r.buyer?.id, name: r.buyer?.fullName, avatar: r.buyer?.image }
        : { id: r.seller?.id, name: r.seller?.fullName, avatar: r.seller?.image },
  }));
}

/** Lịch sử tin nhắn theo cursor (cuộn lên) */
async getHistory(roomId: number, userId: number, cursor?: string, limit = 30) {
  const qb = this.messageRepo
    .createQueryBuilder('m')
    .where('m.conversation_id = :roomId', { roomId })
    .orderBy('m.created_at', 'DESC')
    .limit(limit);

  if (cursor) qb.andWhere('m.created_at < :cursor', { cursor });

  const msgs = await qb.getMany();
  return msgs.reverse(); // để trả theo thứ tự cũ ASC
}

}
