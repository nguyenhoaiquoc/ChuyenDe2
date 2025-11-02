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

  /** 🧩 Tạo hoặc lấy room giữa hai user (fix duplicate room) */
  async openOrCreateRoom(userA: number, userB: number, productId?: number) {
  let room = await this.roomRepo.findOne({
    where: [
      { seller_id: userA, buyer_id: userB, room_type: 'PAIR' },
      { seller_id: userB, buyer_id: userA, room_type: 'PAIR' },
    ],
  });

  if (!room) {
    room = this.roomRepo.create({
      seller_id: userA,
      buyer_id: userB,
      room_type: 'PAIR',
      product_id: productId ?? null,   // ✅ thêm dòng này
    });
    await this.roomRepo.save(room);

    await this.partRepo.insert([
      { conversation_id: room.id, user_id: userA, role: 'SELLER' },
      { conversation_id: room.id, user_id: userB, role: 'BUYER' },
    ]);
  }

  return room;
}

  /** 💬 Gửi tin nhắn (text hoặc media) */
async sendMessage(
  conversationId: number,
  senderId: number,
  receiverId: number,
  content: string,
  productId?: number,
  mediaUrl?: string | null, // 👈 thêm | null
) {
  const msg = this.messageRepo.create({
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: receiverId,
    product_id: productId ?? null,
    content,
    media_url: mediaUrl ?? null,  // Lưu URL của ảnh nếu có
    message_type: mediaUrl ? 'IMAGE' : 'TEXT',
  });

  const saved = await this.messageRepo.save(msg);

  // Cập nhật phòng trò chuyện
  await this.roomRepo.update(conversationId, {
    last_message_id: saved.id,
    last_message_at: saved.created_at,
    last_product_id: productId ?? null,
  });

  return saved;
}

  /** ✅ Đánh dấu tin nhắn đã đọc */
async markRead(conversationId: number, userId: number) {
  // 1) Ghi nhận thời điểm đọc
  await this.partRepo.update(
    { conversation_id: conversationId, user_id: userId },
    { last_read_at: new Date() },
  );

  // 2) Đặt cờ is_read cho các tin chưa đọc gửi tới user này trong room
  await this.messageRepo
    .createQueryBuilder()
    .update()
    .set({ is_read: true })
    .where('conversation_id = :conversationId', { conversationId })
    .andWhere('receiver_id = :userId', { userId })
    .andWhere('is_read = false')
    .execute();
}


  /** 📜 Lấy danh sách các cuộc chat (chatlist) */
 /** 📜 Lấy danh sách các cuộc chat (có số tin chưa đọc) */
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

  // 🔁 Đếm số tin chưa đọc từng phòng
  const unreadCounts = await this.messageRepo
    .createQueryBuilder('msg')
    .select('msg.conversation_id', 'conversation_id')
    .addSelect('COUNT(msg.id)', 'count')
    .where('msg.receiver_id = :userId', { userId })
    .andWhere('msg.is_read = false')
    .groupBy('msg.conversation_id')
    .getRawMany();

  const unreadMap = new Map(
    unreadCounts.map((r) => [Number(r.conversation_id), Number(r.count)]),
  );

  return rooms.map((r) => ({
    room_id: r.id,
    last_message: r.last_message?.content || '',
    last_message_at: r.last_message_at,
    unread_count: unreadMap.get(r.id) || 0, // ✅ thêm vào
    product: r.last_product
      ? { id: r.last_product.id, name: r.last_product['name'] }
      : null,
    partner:
      r.seller_id === userId
        ? { id: r.buyer?.id, name: r.buyer?.fullName, avatar: r.buyer?.image }
        : { id: r.seller?.id, name: r.seller?.fullName, avatar: r.seller?.image },
  }));
}

  /** 🧱 Lấy lịch sử tin nhắn theo roomId (fix đủ 2 chiều) */
  async getHistory(roomId: number, userId: number, cursor?: string, limit = 30) {
    console.log(`📜 Lấy lịch sử roomId=${roomId}, userId=${userId}`);

    // 🔍 Lấy thông tin room để biết seller & buyer
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) {
      console.log('⚠️ Không tìm thấy room');
      return [];
    }

    const sellerId = room.seller_id;
    const buyerId = room.buyer_id;

    // 🔁 Lấy tin nhắn giữa 2 người bất kể chiều nào
    const qb = this.messageRepo
      .createQueryBuilder('m')
      .where(
        '(m.sender_id = :sellerId AND m.receiver_id = :buyerId) OR (m.sender_id = :buyerId AND m.receiver_id = :sellerId)',
        { sellerId, buyerId },
      )
      .andWhere('m.conversation_id = :roomId', { roomId })
      .orderBy('m.created_at', 'ASC')
      .limit(limit);

    if (cursor) qb.andWhere('m.created_at < :cursor', { cursor });

    const msgs = await qb.getMany();
    console.log('💾 Messages tìm thấy:', msgs.length);
    return msgs;
  }
 /** 🔢 Đếm số người (conversation) có tin nhắn chưa đọc */
async countUnreadMessages(userId: number): Promise<number> {
  const result = await this.messageRepo
    .createQueryBuilder('m')
    .select('COUNT(DISTINCT m.sender_id)', 'count')
    .where('m.receiver_id = :userId', { userId })
    .andWhere('m.is_read = false')
    .getRawOne();

  return Number(result?.count || 0);
}

/** 🗑️ Thu hồi tin nhắn (recall) */
async recallMessage(messageId: number, userId: number) {
  const msg = await this.messageRepo.findOne({
    where: { id: Number(messageId) },
  });
  if (!msg) throw new Error('Không tìm thấy tin nhắn');

  // ✅ ép kiểu để so sánh đúng
  if (Number(msg.sender_id) !== Number(userId)) {
    throw new Error('Bạn không thể thu hồi tin nhắn này');
  }

  if (msg.is_recalled) return msg;

  msg.is_recalled = true;
  msg.recalled_by = userId;
  msg.recalled_at = new Date();
  msg.content = null;
  msg.media_url = null;

  const saved = await this.messageRepo.save(msg);
  return saved;
}


/** 💬 Trả lời tin nhắn */
async replyMessage(
  roomId: number,
  senderId: number,
  receiverId: number,
  content: string,
  replyToId: number,
) {
  const replyMsg = this.messageRepo.create({
    conversation_id: roomId,
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    reply_to_id: replyToId,
    message_type: 'TEXT',
  });

  const saved = await this.messageRepo.save(replyMsg);

  await this.roomRepo.update(roomId, {
    last_message_id: saved.id,
    last_message_at: saved.created_at,
  });

  return saved;
}

/** ✏️ Sửa tin nhắn (đã có – nâng cấp emit dùng socket ở gateway) */
async editMessage(userId: number, messageId: number, newContent: string) {
  const msg = await this.messageRepo.findOne({ where: { id: messageId } });
  if (!msg) throw new Error('Không tìm thấy tin nhắn');
if (Number(msg.sender_id) !== Number(userId)) throw new Error('Bạn không thể sửa tin này');

  if (msg.is_recalled) throw new Error('Tin nhắn đã thu hồi không thể chỉnh sửa');

  msg.content = newContent;
  msg.is_edited = true;
  msg.edit_count = (msg.edit_count ?? 0) + 1;
  msg.edited_at = new Date();

  const saved = await this.messageRepo.save(msg);
  return saved;
}


}
