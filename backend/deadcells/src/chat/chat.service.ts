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

/** 🔎 Tìm kiếm tin nhắn theo nội dung (giới hạn theo phòng user tham gia) */
  async searchMessages(
    userId: number,
    q: string,
    opts?: { roomId?: number; cursor?: string; limit?: number },
  ) {
    const keyword = (q ?? '').trim();
    if (keyword.length < 3) throw new Error('Tối thiểu 3 ký tự');

    const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 50);

    const run = async (useUnaccent: boolean, useSimilarity: boolean) => {
      const qb = this.messageRepo
        .createQueryBuilder('m')
        .innerJoin(
          ConversationParticipant,
          'cp',
          'cp.conversation_id = m.conversation_id AND cp.user_id = :uid',
          { uid: userId },
        )
        .andWhere('m.message_type = :t', { t: 'TEXT' })
        .andWhere('m.is_recalled = false');

      if (opts?.roomId) qb.andWhere('m.conversation_id = :rid', { rid: opts.roomId });
      if (opts?.cursor) qb.andWhere('m.created_at < :cursor', { cursor: new Date(opts.cursor) });

      const expr = useUnaccent ? `public.unaccent(m.content)` : `m.content`;
      const likeParam = `%${keyword}%`;
      qb.andWhere(`${expr} ILIKE ${useUnaccent ? 'public.unaccent(:like)' : ':like'}`, { like: likeParam });

      if (useSimilarity) {
        qb.addSelect(
          `similarity(${useUnaccent ? 'public.unaccent(m.content)' : 'm.content'}, ${useUnaccent ? 'public.unaccent(:kw)' : ':kw'})`,
          'rank',
        )
          .setParameter('kw', keyword)
          .orderBy('rank', 'DESC')
          .addOrderBy('m.created_at', 'DESC');
      } else {
        qb.addSelect('0.0::float', 'rank').orderBy('m.created_at', 'DESC');
      }

      qb.limit(limit + 1);

      const rows = await qb.getRawAndEntities();

      const items = rows.entities.map((m, i) => {
        const raw = rows.raw[i]?.rank;
        const num = typeof raw === 'number' ? raw : Number.parseFloat(raw ?? '0');
        const rounded = Number.isFinite(num) ? Math.round(num * 1e4) / 1e4 : 0;

        return {
          id: m.id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          content: m.content,
          created_at: m.created_at,
          rank: rounded,
        };
      });

      let nextCursor: string | null = null;
      if (items.length > limit) {
        const tail = items.pop()!;
        nextCursor = tail.created_at.toISOString();
      }

      return { items, nextCursor };
    };

    try {
      return await run(true, true); // unaccent + similarity
    } catch (e: any) {
      if (e?.code === '42883' && /unaccent/i.test(e?.message || '')) {
        try {
          return await run(false, true); // similarity only
        } catch (e2: any) {
          if (e2?.code === '42883' && /similarity/i.test(e2?.message || '')) {
            return await run(false, false); // plain ILIKE
          }
          throw e2;
        }
      }
      if (e?.code === '42883' && /similarity/i.test(e?.message || '')) {
        return await run(true, false); // unaccent only
      }
      throw e;
    }
  }
/** 📍 Lấy window tin nhắn quanh 1 message (để jump) */
async getHistoryAround(
  roomId: number,
  userId: number,
  messageId: number,
  window = 40, // tổng số tin trả về quanh anchor
) {
  // 0) Verify user tham gia room
  const exist = await this.partRepo.findOne({ where: { conversation_id: roomId, user_id: userId } });
  if (!exist) throw new Error('Bạn không thuộc phòng này');

  // 1) Lấy anchor message
  const anchor = await this.messageRepo.findOne({ where: { id: messageId, conversation_id: roomId } });
  if (!anchor) throw new Error('Message không tồn tại trong room');

  const half = Math.max(1, Math.floor(window / 2));

  // 2) Lấy các tin trước (bao gồm anchor) — desc rồi đảo lại
  const beforeDesc = await this.messageRepo.createQueryBuilder('m')
    .where('m.conversation_id = :roomId', { roomId })
    .andWhere('m.created_at <= :t', { t: anchor.created_at })
    .orderBy('m.created_at', 'DESC')
    .limit(half + 1) // +1 để chắc chắn có anchor
    .getMany();
  const before = beforeDesc.reverse();

  // 3) Lấy các tin sau — asc
  const after = await this.messageRepo.createQueryBuilder('m')
    .where('m.conversation_id = :roomId', { roomId })
    .andWhere('m.created_at > :t', { t: anchor.created_at })
    .orderBy('m.created_at', 'ASC')
    .limit(half)
    .getMany();

  // 4) Gộp và tìm index của anchor
  const items = [...before, ...after];
  const anchorIndex = items.findIndex(x => Number(x.id) === Number(messageId));

  return { items, anchorIndex };
}
/** 🧩 Lấy meta của 1 room (giống shape trong chatList) */
async getRoomMetaData(userId: number, roomId: number) {
  // Lấy room + các liên kết cần thiết
  const room = await this.roomRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.seller', 'seller')
    .leftJoinAndSelect('r.buyer', 'buyer')
    .leftJoinAndSelect('r.last_message', 'm')
    .leftJoinAndSelect('r.last_product', 'p')
    .where('r.id = :roomId', { roomId })
    .getOne();

  if (!room) return null;

  // Xác thực quyền: user phải là participant hoặc là seller/buyer của room
  const isPart = await this.partRepo.findOne({
    where: { conversation_id: roomId, user_id: userId },
  });
  if (!isPart && room.seller_id !== userId && room.buyer_id !== userId) {
    return null;
  }

  // Đếm tin chưa đọc trong room dành cho user này
  const unreadRaw = await this.messageRepo
    .createQueryBuilder('msg')
    .select('COUNT(msg.id)', 'count')
    .where('msg.conversation_id = :roomId', { roomId })
    .andWhere('msg.receiver_id = :userId', { userId })
    .andWhere('msg.is_read = false')
    .getRawOne();

  const unreadCount = Number(unreadRaw?.count || 0);

  // Map meta giống getChatList
  const meta = {
    room_id: room.id,
    last_message: room.last_message?.content || '',
    last_message_at: room.last_message_at,
    unread_count: unreadCount,
    product: room.last_product
      ? { id: room.last_product.id, name: (room.last_product as any)['name'] }
      : null,
    partner:
      room.seller_id === userId
        ? { id: room.buyer?.id, name: room.buyer?.fullName, avatar: room.buyer?.image }
        : { id: room.seller?.id, name: room.seller?.fullName, avatar: room.seller?.image },
  };

  return meta;
}


}
