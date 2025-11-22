import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ConversationRoom } from 'src/entities/conversation-room.entity';
import { ConversationParticipant } from 'src/entities/conversation-participant.entity';
import { Message } from 'src/entities/message.entity';
import { GroupMember } from 'src/entities/group-member.entity';
import { Group } from 'src/entities/group.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ConversationRoom)
    public readonly roomRepo: Repository<ConversationRoom>,
    @InjectRepository(ConversationParticipant)
    private readonly partRepo: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(GroupMember)
    private readonly groupMembersRepo: Repository<GroupMember>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
  ) {}

/** 🧩 Tạo hoặc lấy room giữa hai user */
async openOrCreateRoom(currentUserId: number, targetUserId: number, productId?: number) {
  // 1️⃣ Kiểm tra room PAIR tồn tại chưa
  let room = await this.roomRepo
    .createQueryBuilder('room')
    .leftJoin('room.participants', 'participant')
    .where('room.room_type = :type', { type: 'PAIR' })
    .andWhere('participant.user_id IN (:...users)', { users: [currentUserId, targetUserId] })
    .groupBy('room.id')
    .having('COUNT(participant.user_id) = 2')
    .getOne();

  // 2️⃣ Nếu chưa có, tạo mới
  if (!room) {
    room = this.roomRepo.create({
      room_type: 'PAIR',
      participants_count: 2,
    });
    await this.roomRepo.save(room);

    // 3️⃣ Thêm participant cả 2 user
    await this.partRepo.insert([
      { conversation_id: room.id, user_id: currentUserId, role: 'MEMBER' },
      { conversation_id: room.id, user_id: targetUserId, role: 'MEMBER' },
    ]);
  } else {
    // 4️⃣ Nếu room có rồi nhưng thiếu partner (trường hợp cũ) → thêm partner
    const participants = await this.partRepo.find({ where: { conversation_id: room.id } });
    const existingIds = participants.map(p => p.user_id);
    if (!existingIds.includes(currentUserId)) {
      await this.partRepo.save({ conversation_id: room.id, user_id: currentUserId, role: 'MEMBER' });
    }
    if (!existingIds.includes(targetUserId)) {
      await this.partRepo.save({ conversation_id: room.id, user_id: targetUserId, role: 'MEMBER' });
    }
  }

  // 5️⃣ Lấy đầy đủ participants kèm thông tin user
  room = await this.roomRepo.findOne({
    where: { id: room.id },
    relations: ['participants', 'participants.user', 'last_message'],
  });

  return room;
}


async sendMessage(
  conversationId: number,
  senderId: number,
  receiverId: number | null,
  content: string,
  productId?: number,
  mediaUrl?: string | null,
) {
  // 1️⃣ Lấy room + participants
  const room = await this.roomRepo.findOne({
    where: { id: conversationId },
    relations: ['participants'],
  });
  if (!room) throw new Error('Room không tồn tại');

  // 2️⃣ Tự xác định receiver cho PAIR (không tin tưởng FE)
  let finalReceiverId: number | null = null;

  if (room.room_type === 'PAIR') {
    finalReceiverId =
      receiverId ??
      room.participants.find((p) => Number(p.user_id) !== Number(senderId))?.user_id ??
      null;
  }

  // 3️⃣ Tạo message
  const msg = this.messageRepo.create({
    conversation_id: conversationId,
    sender_id: senderId,
    receiver_id: finalReceiverId,            // 👈 PAIR: khác sender; GROUP: null
    content,
    product_id: productId ?? null,
    media_url: mediaUrl ?? null,
    message_type: mediaUrl ? 'IMAGE' : 'TEXT',
    is_read: false,                          // đảm bảo default là chưa đọc
  });

  const saved = await this.messageRepo.save(msg);

  // 4️⃣ Cập nhật last_message
  await this.roomRepo.update(conversationId, {
    last_message_id: saved.id,
    last_message_at: saved.created_at,
  });

  return saved;
}





  /** ✅ Đánh dấu tin nhắn đã đọc */
async markRead(conversationId: number, userId: number) {
  const room = await this.roomRepo.findOne({ where: { id: conversationId } });
  if (!room) return;

  const now = new Date();

  // 1️⃣ Update mốc đọc cho participant – dùng cho GROUP
  await this.partRepo.update(
    { conversation_id: conversationId, user_id: userId },
    { last_read_at: now },
  );

  // 2️⃣ PAIR: set is_read = true cho tin gửi tới user này trong room
  if (room.room_type === 'PAIR') {
    await this.messageRepo
      .createQueryBuilder()
      .update()
      .set({ is_read: true })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('receiver_id = :userId', { userId })
      .andWhere('is_read = false')
      .execute();
  }

  // GROUP: chỉ dùng last_read_at để tính unread, không cần đụng is_read
}



async getChatList(userId: number, limit = 20, offset = 0) {
  const rooms = await this.roomRepo
    .createQueryBuilder('r')
    .leftJoinAndSelect('r.group', 'group')
    .innerJoin('r.participants', 'me', 'me.user_id = :userId', { userId })
    .leftJoinAndSelect('r.participants', 'p')
    .leftJoinAndSelect('p.user', 'u')
    .leftJoinAndSelect('r.last_message', 'm')
    .orderBy('r.last_message_at', 'DESC')
    .take(limit)
    .skip(offset)
    .getMany();

  // 🔹 Unread cho PAIR
  const privateUnread = await this.messageRepo
    .createQueryBuilder('msg')
    .select('msg.conversation_id', 'conversation_id')
    .addSelect('COUNT(msg.id)', 'count')
    .where('msg.receiver_id = :userId', { userId })
    .andWhere('msg.is_read = false')
    .andWhere('msg.is_recalled = false')
    .groupBy('msg.conversation_id')
    .getRawMany();

  const privateMap = new Map(
    privateUnread.map((r) => [Number(r.conversation_id), Number(r.count)]),
  );

  // 🔹 Unread cho GROUP (dùng last_read_at)
  const epoch = new Date(0);
  const groupUnread = await this.messageRepo
    .createQueryBuilder('m')
    .innerJoin(ConversationRoom, 'r', 'r.id = m.conversation_id')
    .innerJoin(
      ConversationParticipant,
      'cp',
      'cp.conversation_id = r.id AND cp.user_id = :userId',
      { userId },
    )
    .select('m.conversation_id', 'conversation_id')
    .addSelect('COUNT(m.id)', 'count')
    .where('r.room_type = :type', { type: 'GROUP' })
    .andWhere('m.sender_id != :userId', { userId })
    .andWhere('m.is_recalled = false')
    .andWhere('m.created_at > COALESCE(cp.last_read_at, :epoch)', { epoch })
    .groupBy('m.conversation_id')
    .getRawMany();

  const groupMap = new Map(
    groupUnread.map((r) => [Number(r.conversation_id), Number(r.count)]),
  );

  return rooms.map((r) => {
    const partners = r.participants.filter((p) => p.user?.id !== userId);

    const partnerData =
      r.room_type === 'PAIR' && partners.length > 0
        ? {
            id: partners[0].user.id,
            name: partners[0].user.nickname,
            avatar: partners[0].user.image,
          }
        : null;

    const unread_count =
      (privateMap.get(r.id) || 0) + (groupMap.get(r.id) || 0);

    return {
      room_id: r.id,
      last_message: r.last_message?.content || '',
      last_message_at: r.last_message_at,
      unread_count,
      partner: partnerData,
      group:
        r.room_type === 'GROUP' && r.group
          ? {
              id: r.group.id,
              name: r.group.name,
              thumbnail_url: r.group.thumbnail_url,
            }
          : null,
    };
  });
}





 /** 🧱 Lấy lịch sử tin nhắn theo roomId (hỗ trợ chat 1-1 và nhóm) */
async getHistory(roomId: number, userId: number, cursor?: string, limit = 100) {
  console.log(`📜 Lấy lịch sử roomId=${roomId}, userId=${userId}`);

  // 1️⃣ Lấy room
  const room = await this.roomRepo.findOne({
    where: { id: roomId },
  });
  if (!room) {
    console.log('⚠️ Không tìm thấy room');
    return [];
  }

  // 2️⃣ Kiểm tra user có quyền xem
 let isParticipant = false;

if (room.room_type === 'PAIR') {
  const participants = await this.partRepo.find({ where: { conversation_id: roomId } });
  isParticipant = participants.some(p => Number(p.user_id) === Number(userId));
} else if (room.room_type === 'GROUP') {
  const count = await this.groupMembersRepo.count({
    where: { group: { id: room.group_id }, user_id: userId },
  });
  isParticipant = count > 0;
}


  if (!isParticipant) {
    console.log('⚠️ User không thuộc room này');
    return [];
  }

  // 3️⃣ Lấy tin nhắn
  const qb = this.messageRepo
    .createQueryBuilder('m')
    .where('m.conversation_id = :roomId', { roomId })
    .orderBy('m.created_at', 'ASC')
    .limit(limit);

  if (cursor) qb.andWhere('m.created_at < :cursor', { cursor });

  const msgs = await qb.getMany();
  console.log('💾 Messages tìm thấy:', msgs.length);
  return msgs;
}


 /** 🔢 Đếm số người (conversation) có tin nhắn chưa đọc */
async countUnreadMessages(userId: number): Promise<number> {
  // 🔹 1–1: tin nhắn gửi trực tiếp tới userId, chưa đọc
  const privateCount = await this.messageRepo
    .createQueryBuilder('m')
    .where('m.receiver_id = :userId', { userId })
    .andWhere('m.is_read = false')
    .andWhere('m.is_recalled = false')
    .getCount();

  // 🔹 GROUP: tin nhắn trong các room GROUP mà userId chưa đọc (dựa vào last_read_at)
  const epoch = new Date(0);

  const groupCount = await this.messageRepo
    .createQueryBuilder('m')
    .innerJoin(ConversationRoom, 'r', 'r.id = m.conversation_id')
    .innerJoin(
      ConversationParticipant,
      'cp',
      'cp.conversation_id = r.id AND cp.user_id = :userId',
      { userId },
    )
    .where('r.room_type = :type', { type: 'GROUP' })
    .andWhere('m.sender_id != :userId', { userId }) // không tính tin do chính userId gửi
    .andWhere('m.is_recalled = false')
    .andWhere('m.created_at > COALESCE(cp.last_read_at, :epoch)', { epoch })
    .getCount();

  const total = privateCount + groupCount;

  // 👀 thêm log debug 1 lần để xem
  console.log(
    `[countUnreadMessages] user=${userId} private=${privateCount} group=${groupCount} total=${total}`,
  );

  return total;
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
  const room = await this.roomRepo.findOne({
    where: { id: roomId },
    relations: [
      'participants',
      'participants.user',
      'last_message',
      'group',
    ],
  });

  if (!room) return null;

  const isPart = room.participants.some((p) => p.user_id === userId);
  if (!isPart) return null;

  const unreadRaw = await this.messageRepo
    .createQueryBuilder('msg')
    .select('COUNT(msg.id)', 'count')
    .where('msg.conversation_id = :roomId', { roomId })
    .andWhere('msg.receiver_id = :userId', { userId })
    .andWhere('msg.is_read = false')
    .getRawOne();

  const unreadCount = Number(unreadRaw?.count || 0);

  const partners = room.participants.filter((p) => p.user_id !== userId);

  return {
    room_id: room.id,
    last_message: room.last_message?.content || '',
    last_message_at: room.last_message_at,
    unread_count: unreadCount,

    // === PAIR ===
    partner:
      room.room_type === 'PAIR' && partners.length > 0 && partners[0].user
        ? {
            id: partners[0].user.id,
            name: partners[0].user.nickname,
            avatar: partners[0].user.image,
          }
        : null,

    // === GROUP (fix crash tại đây) ===
    group:
      room.room_type === 'GROUP' && room.group
        ? {
            id: room.group.id,
            name: room.group.name,
            thumbnail_url: room.group.thumbnail_url,
          }
        : null,
  };
}


  async getUnreadMessages(userId: number) {
    const unreadMessages = await this.messageRepo.find({
      where: {
        receiver_id: userId, // Lọc theo người nhận
        is_read: false, // Lọc các tin nhắn chưa đọc
      },
      relations: ['sender'], // Nếu bạn muốn lấy thông tin người gửi
      order: {
        created_at: 'DESC', // Sắp xếp theo thời gian tạo tin nhắn
      },
    });

    if (!unreadMessages || unreadMessages.length === 0) {
      throw new NotFoundException('Không có tin nhắn chưa đọc');
    }

    return unreadMessages;
  }

  async createRoomGroup(groupId: number) {
       // check room tồn tại chưa
  let room = await this.roomRepo.findOne({ where: { group_id: groupId } });
   const group = await this.groupRepo.findOne({
    where: { id: groupId },
  });

  // nếu chưa có thì tạo 1 room
  if (!room) {
    room = await this.roomRepo.save(
      this.roomRepo.create({
        group_id: groupId,
        room_type: 'GROUP',
        title: group?.name, 
        group_avatar: group?.thumbnail_url,
      })
    );
  } 

  // lấy tất cả group members đã duyệt
  const members = await this.groupMembersRepo.find({
    where: { group_id: groupId, pending: 3 },
  });

  // lấy participant hiện có
  const existingParts = await this.partRepo.find({
    where: { conversation_id: room.id },
  });

  const existingUserIds = new Set(existingParts.map(p => p.user_id));

  // add những user chưa có
  const newParticipants = members
    .filter(m => !existingUserIds.has(m.user_id))
    .map(m =>
      this.partRepo.create({
        conversation_id: room.id,
        user_id: m.user_id,
        role: 'MEMBER',
      })
    );

  if (newParticipants.length > 0) {
    await this.partRepo.save(newParticipants);
  }

  // update số lượng
  room.participants_count = members.length;
  await this.roomRepo.save(room);

  return room;
  }
async countUnreadMessagesByRoom(userId: number, roomId: number): Promise<number> {
  const room = await this.roomRepo.findOne({
    where: { id: roomId },
    relations: ['participants'],
  });
  if (!room) return 0;

  if (room.room_type === 'PAIR') {
    // Tin nhắn 1–1 gửi tới user này trong room
    return await this.messageRepo.count({
      where: {
        conversation_id: roomId,
        receiver_id: userId,
        is_read: false,
        is_recalled: false,
      },
    });
  } else {
    // GROUP
    const participant = room.participants.find((p) => p.user_id === userId);
    if (!participant) return 0;

    const since = participant.last_read_at ?? new Date(0);

    return await this.messageRepo
      .createQueryBuilder('m')
      .where('m.conversation_id = :roomId', { roomId })
      .andWhere('m.sender_id != :userId', { userId })
      .andWhere('m.is_recalled = false')
      .andWhere('m.created_at > :since', { since })
      .getCount();
  }
}


}
