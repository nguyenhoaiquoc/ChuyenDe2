import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { GroupMember } from 'src/entities/group-member.entity';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async findAll(options?: FindManyOptions<Group>): Promise<Group[]> {
    return this.groupRepo.find({
      relations: ['owner', 'status', 'members'],
      order: { created_at: 'DESC' },
      ...options, // Cho phép truyền thêm điều kiện như take
    });
  }

  async create(data: Partial<Group>, userId: number): Promise<Group> {
    // 1. Tạo nhóm
    const group = this.groupRepo.create({
      name: data.name,
      isPublic: data.isPublic ?? true,
      thumbnail_url: data.thumbnail_url || undefined,
      owner_id: userId,
      count_member: 1,
      status_id: 1, //hoạt đọng
    });

    const savedGroup = await this.groupRepo.save(group);

    // 2. Tạo bản ghi group_members
    const member = this.groupMemberRepo.create({
      group_id: savedGroup.id,
      user_id: savedGroup.owner_id,
      group_role_id: 2, // 1.member 2.leader
    });

    await this.groupMemberRepo.save(member);

    return savedGroup;
  }

  async getLatestGroups(userId: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      relations: ['group'],
    });

    const joinedGroups = memberships
      .map((m) => m.group)
      .filter((g) => g)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 5);

    return joinedGroups.map((g) => ({
      id: g.id,
      name: g.name,
      members: `${g.count_member} thành viên`,
      posts: 'Chưa có dữ liệu bài viết',
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
      isPublic: g.isPublic,
    }));
  }

  async getFeaturedGroups() {
    const groups = await this.groupRepo.find({
      order: { count_member: 'DESC' },
      take: 5,
    });

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: `${g.count_member} thành viên`,
      posts: 'Chưa có dữ liệu bài viết',
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
      isPublic: g.isPublic,
    }));
  }

  //KT thành vien
  async isMember(groupId: number, userId: number): Promise<boolean> {
    const count = await this.groupMemberRepo.count({
      where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
  }

  //  User vào group
  async joinGroup(groupId: number, userId: number): Promise<GroupMember> {
    const exists = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (exists) return exists; // Đã là thành viên → không thêm lại

    //  Tạo bản ghi thành viên mới
    const member = this.groupMemberRepo.create({
      group_id: groupId,
      user_id: userId,
      group_role_id: 1, // 1 = member, 2 leader
    });

    const saved = await this.groupMemberRepo.save(member);

    // Tăng số lượng thành viên
    await this.groupRepo.increment({ id: groupId }, 'count_member', 1);

    return saved;
  }

  //  User rời group
  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await this.groupMemberRepo.delete({ group_id: groupId, user_id: userId });
  }

  // 🔧 Hàm format dùng chung
  private formatPost(p: Product) {
    return {
      id: String(p.id),
      image:
        p.images?.find((img) => !!img.image_url)?.image_url ||
        p.thumbnail_url ||
        null,
      name: p.name,
      authorName: p.user?.fullName || 'Ẩn danh',
      price: p.price ? `${p.price.toLocaleString('vi-VN')} đ` : 'Thỏa thuận',
      location:
        (p.address_json as any)?.ward ||
        (p.address_json as any)?.district ||
        'Không rõ',
      time: new Date(p.created_at).toLocaleString('vi-VN'),
      tag: p.subCategory?.name || '',
      category: p.category?.name,
      subCategory: p.subCategory
        ? {
            id: p.subCategory.id,
            name: p.subCategory.name,
            source_table: p.subCategory.source_table,
            source_detail: p.subCategory.source_table,
          }
        : undefined,
      imageCount: p.images?.length || 0,
      isFavorite: false,
      groupName: p.group?.name || 'Không rõ nhóm',
      groupImage: p.group?.thumbnail_url || null,
    };
  }

  async findGroupsOfUser(userId: number): Promise<Group[]> {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      relations: ['group'],
    });

    return memberships.map((m) => m.group).filter((g) => g);
  }

  //  Lấy bài viết từ các nhóm user tham gia
  async findPostsFromUserGroups(userId: number, limit?: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      select: ['group_id'],
    });

    const groupIds = memberships.map((m) => m.group_id);
    if (groupIds.length === 0) return [];

    const posts = await this.productRepo.find({
      where: { group_id: In(groupIds), status_id: 1 },
      order: { created_at: 'DESC' },
      take: limit || undefined,
      relations: ['images', 'user', 'category', 'subCategory', 'group'],
    });

    return posts.map((p) => this.formatPost(p));
  }

  // ✅ Lấy bài viết từ một nhóm cụ thể
  async findPostsByGroup(groupId: number, limit?: number) {
    const posts = await this.productRepo.find({
      where: { group_id: groupId, status_id: 1 },
      order: { created_at: 'DESC' },
      take: limit || undefined,
      relations: ['images', 'user', 'category', 'subCategory', 'group'],
    });

    return posts.map((p) => this.formatPost(p));
  }

  async findGroupsUserNotJoined(userId?: number) {
    let allGroups = await this.groupRepo.find({
      relations: ['owner', 'members'],
      order: { created_at: 'DESC' },
    });

    // Nếu có user → lọc ra nhóm chưa tham gia
    if (userId) {
      const joinedGroupIds = await this.groupMemberRepo.find({
        where: { user_id: userId },
        select: ['group_id'],
      });

      const joinedIdsSet = new Set(joinedGroupIds.map((g) => g.group_id));
      allGroups = allGroups.filter((g) => !joinedIdsSet.has(g.id));
    }

    // Trả về dữ liệu đầy đủ cho FE
    return allGroups.map((g) => ({
      id: g.id,
      name: g.name,
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
      memberCount: `${g.count_member} `,
      isPublic: g.isPublic,
      // commonFriends: {
      //   count: 0,
      //   avatars: [],
      // },
    }));
  }
}
