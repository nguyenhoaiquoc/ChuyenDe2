import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { GroupMember } from 'src/entities/group-member.entity';
import { ProductService } from 'src/product/product.service';
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

  async create(data: Partial<Group>): Promise<Group> {
    const group = this.groupRepo.create({
      name: data.name,
      isPublic: data.isPublic ?? true,
      thumbnail_url: data.thumbnail_url || undefined,
      owner_id: 1,
      count_member: 1,
      status_id: 1,
    });

    return this.groupRepo.save(group);
  }

  //KT thành vien
  async isMember(groupId: number, userId: number): Promise<boolean> {
    const count = await this.groupMemberRepo.count({
      where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
  }

  //  User vào group
  async joinGroup(
    groupId: number,
    userId: number,
    roleId = 2,
  ): Promise<GroupMember> {
    const exists = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (exists) return exists;

    const member = this.groupMemberRepo.create({
      group_id: groupId,
      user_id: userId,
      group_role_id: 1,
    });
    return this.groupMemberRepo.save(member);
  }

  //  User rời group
  async leaveGroup(groupId: number, userId: number): Promise<void> {
    await this.groupMemberRepo.delete({ group_id: groupId, user_id: userId });
  }

  async findPostsFromUserGroups(userId: number, limit?: number) {
    // 1️ Lấy danh sách group mà user là thành viên
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      select: ['group_id'],
    });

    const groupIds = memberships.map((m) => m.group_id);
    if (groupIds.length === 0) return [];

    // 2️ Lấy danh sách bài viết thuộc các group đó
    const posts = await this.productRepo.find({
      where: { group_id: In(groupIds), status_id: 1 },
      order: { created_at: 'DESC' },
      take: limit || undefined,
      relations: ['images', 'user', 'category', 'subCategory', 'group'],
    });

    // 3️ Format dữ liệu theo đúng cấu trúc FE mong muốn
    return posts.map((p) => ({
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
    }));
  }
}
