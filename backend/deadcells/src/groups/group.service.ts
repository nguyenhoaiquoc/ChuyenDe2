import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from 'src/entities/group-member.entity';
import { Product } from 'src/entities/product.entity';
import { Repository, FindManyOptions, In } from 'typeorm';
import { ProductStatus } from 'src/entities/product-status.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductStatus)
    private readonly productStatusRepo: Repository<ProductStatus>,
  ) {}

  // ==================== CRUD Groups ====================

  /** Tạo nhóm mới */
  async create(data: Partial<Group>, userId: number): Promise<Group> {
    const group = this.groupRepo.create({
      name: data.name,
      description: data.description,
      isPublic: data.isPublic ?? true,
      mustApprovePosts: data.isPublic ? true : false,
      thumbnail_url: data.thumbnail_url || undefined,
      owner_id: userId,
      count_member: 1,
      status_id: 1,
    });
    const savedGroup = await this.groupRepo.save(group);

    const member = this.groupMemberRepo.create({
      group_id: savedGroup.id,
      user_id: userId,
      group_role_id: 2, // leader
    });
    await this.groupMemberRepo.save(member);

    return savedGroup;
  }

  /** Cập nhật thông tin nhóm */
  async updateGroup(
    groupId: number,
    userId: number,
    data: {
      name?: string;
      description?: string;
      thumbnail_url?: string;
      mustApprovePosts?: boolean;
    },
  ): Promise<Group> {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException(
        'Chỉ trưởng nhóm mới có quyền sửa thông tin',
      );
    }

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    if (data.name !== undefined) group.name = data.name;
    if (data.description !== undefined) group.description = data.description;
    if (data.thumbnail_url !== undefined)
      group.thumbnail_url = data.thumbnail_url;
    if (data.mustApprovePosts !== undefined)
      group.mustApprovePosts = data.mustApprovePosts;

    return this.groupRepo.save(group);
  }

  /** Xóa nhóm */
  async deleteGroup(groupId: number, userId: number): Promise<void> {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException('Bạn không có quyền xóa nhóm này');
    }

    await this.groupMemberRepo.delete({ group_id: groupId });
    await this.productRepo.delete({ group_id: groupId });

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    await this.groupRepo.remove(group);
  }

  // ==================== Duyệt Bài Viết ====================

  /** Lấy danh sách bài viết chờ duyệt */
  async getPendingPosts(groupId: number, userId: number) {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException(
        'Chỉ trưởng nhóm mới được xem bài chờ duyệt',
      );
    }

    const posts = await this.productRepo.find({
      where: { group_id: groupId, productStatus: { id: 1 } },
      relations: ['user', 'images', 'postType', 'productStatus'],
      order: { created_at: 'DESC' },
    });

    return posts.map((p) => this.formatPost(p));
  }

  /** Duyệt hoặc từ chối bài viết */
  async approvePost(postId: number, approve: boolean, userId: number) {
    const post = await this.productRepo.findOne({
      where: { id: postId },
      relations: ['group'],
    });
    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const role = await this.getUserRole(post.group_id, userId);
    if (role !== 'leader') {
      throw new ForbiddenException('Chỉ trưởng nhóm mới được duyệt bài viết');
    }

    if (approve) {
      const status = await this.productStatusRepo.findOne({ where: { id: 2 } });
      post.productStatus = status;
      post.is_approved = true;
      await this.productRepo.save(post);
      return { success: true, message: 'Đã duyệt bài viết' };
    } else {
      await this.productRepo.delete(postId);
      return { success: true, message: 'Đã từ chối và xóa bài viết' };
    }
  }

  // ==================== Quản Lý Thành Viên ====================

  /** Lấy danh sách thành viên trong nhóm */
  async getMembers(groupId: number, userId: number) {
    const isMember = await this.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn phải là thành viên để xem danh sách');
    }

    const members = await this.groupMemberRepo.find({
      where: { group_id: groupId },
      relations: ['user', 'role'],
      order: { created_at: 'ASC' },
    });

    return members.map((m) => ({
      id: m.user_id,
      name: m.user.fullName,
      email: m.user.email,
      avatar: m.user.image,
      role: Number(m.group_role_id) === 2 ? 'leader' : 'member',
      roleName: Number(m.group_role_id) === 2 ? 'Trưởng nhóm' : 'Thành viên',
      joinedAt: m.created_at,
    }));
  }

  /** Lấy danh sách yêu cầu tham gia chờ duyệt (cho nhóm private) */
  async getPendingMembers(groupId: number, userId: number) {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException('Chỉ trưởng nhóm mới được duyệt thành viên');
    }

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    // Giả sử bạn có bảng group_join_requests hoặc dùng cột pending trong group_members
    // Ở đây tôi giả định bạn thêm cột is_approved vào GroupMember
    // Nếu chưa có, bạn cần tạo bảng riêng: group_join_requests

    // Tạm thời return empty array, bạn cần tạo entity GroupJoinRequest
    return [];
  }

  /** Duyệt thành viên vào nhóm (cho nhóm private) */
  async approveMember(
    groupId: number,
    targetUserId: number,
    approve: boolean,
    userId: number,
  ) {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException('Chỉ trưởng nhóm mới được duyệt thành viên');
    }

    // Logic duyệt thành viên
    // Giả sử bạn có bảng group_join_requests
    // Xóa request và thêm vào group_members nếu approve = true

    if (approve) {
      const exists = await this.groupMemberRepo.findOne({
        where: { group_id: groupId, user_id: targetUserId },
      });
      if (exists)
        throw new BadRequestException('Người này đã là thành viên rồi');

      const member = this.groupMemberRepo.create({
        group_id: groupId,
        user_id: targetUserId,
        group_role_id: 1,
      });
      await this.groupMemberRepo.save(member);
      await this.groupRepo.increment({ id: groupId }, 'count_member', 1);

      return { success: true, message: 'Đã duyệt thành viên' };
    } else {
      // Xóa request nếu từ chối
      return { success: true, message: 'Đã từ chối yêu cầu tham gia' };
    }
  }

  /** Xóa thành viên khỏi nhóm (chỉ leader) */
  async removeMember(
    groupId: number,
    targetUserId: number,
    userId: number,
  ): Promise<void> {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException(
        'Chỉ trưởng nhóm mới có quyền xóa thành viên',
      );
    }

    const member = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: targetUserId },
    });

    if (!member) throw new NotFoundException('Người này không phải thành viên');
    if (member.group_role_id === 2) {
      throw new BadRequestException('Không thể xóa trưởng nhóm');
    }

    await this.groupMemberRepo.delete({
      group_id: groupId,
      user_id: targetUserId,
    });
    await this.groupRepo.decrement({ id: groupId }, 'count_member', 1);
  }

  /** Chuyển quyền trưởng nhóm */
  async transferLeadership(
    groupId: number,
    newLeaderId: number,
    currentUserId: number,
  ): Promise<void> {
    const role = await this.getUserRole(groupId, currentUserId);
    if (role !== 'leader') {
      throw new ForbiddenException('Chỉ trưởng nhóm mới có quyền chuyển quyền');
    }

    const newLeaderMember = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: newLeaderId },
    });

    if (!newLeaderMember) {
      throw new NotFoundException('Người được chọn không phải thành viên');
    }

    // Chuyển current leader về member
    await this.groupMemberRepo.update(
      { group_id: groupId, user_id: currentUserId },
      { group_role_id: 1 },
    );

    // Chuyển new leader lên
    await this.groupMemberRepo.update(
      { group_id: groupId, user_id: newLeaderId },
      { group_role_id: 2 },
    );

    // Cập nhật owner_id trong bảng groups
    await this.groupRepo.update({ id: groupId }, { owner_id: newLeaderId });
  }

  // ==================== Quản Lý Nội Dung ====================

  /** Thống kê bài viết của user trong nhóm */
  async getMyPostsInGroup(groupId: number, userId: number) {
    const isMember = await this.isMember(groupId, userId);
    if (!isMember) {
      throw new ForbiddenException('Bạn phải là thành viên để xem nội dung');
    }

    const posts = await this.productRepo.find({
      where: { group_id: groupId, user_id: userId },
      relations: ['images', 'postType', 'productStatus'],
      order: { created_at: 'DESC' },
    });

    return {
      total: posts.length,
      approved: posts.filter((p) => p.productStatus?.id === 2).length,
      pending: posts.filter((p) => p.productStatus?.id === 1).length,
      posts: posts.map((p) => this.formatPost(p)),
    };
  }

  // ==================== Join/Leave Group ====================

  async joinGroup(groupId: number, userId: number): Promise<GroupMember> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    const exists = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (exists) throw new BadRequestException('Bạn đã là thành viên');

    // Nếu là nhóm private, cần tạo request thay vì join trực tiếp
    if (!group.isPublic) {
      // TODO: Tạo group_join_request
      throw new BadRequestException(
        'Nhóm riêng tư, vui lòng chờ trưởng nhóm duyệt',
      );
    }

    const member = this.groupMemberRepo.create({
      group_id: groupId,
      user_id: userId,
      group_role_id: 1,
    });
    const saved = await this.groupMemberRepo.save(member);

    await this.groupRepo.increment({ id: groupId }, 'count_member', 1);
    return saved;
  }

  async leaveGroup(groupId: number, userId: number): Promise<void> {
    const member = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });

    if (!member) throw new BadRequestException('Bạn không phải là thành viên');

    if (member.group_role_id === 2) {
      throw new BadRequestException(
        'Leader không thể rời nhóm. Hãy chuyển quyền leader trước.',
      );
    }

    const result = await this.groupMemberRepo.delete({
      group_id: groupId,
      user_id: userId,
    });
    if (result.affected) {
      await this.groupRepo.decrement({ id: groupId }, 'count_member', 1);
    }
  }

  // ==================== Get/List Groups ====================

  async findAll(options?: FindManyOptions<Group>): Promise<Group[]> {
    return this.groupRepo.find({
      relations: ['owner', 'status', 'members'],
      order: { created_at: 'DESC' },
      ...options,
    });
  }

  async findOneById(id: number) {
    return this.groupRepo.findOne({ where: { id } });
  }

  async getFeaturedGroups(limit = 5) {
    const groups = await this.groupRepo.find({
      order: { count_member: 'DESC' },
      take: limit,
    });

    return Promise.all(
      groups.map(async (g) => {
        const postCount = await this.countPostsByGroup(g.id);
        return {
          id: g.id,
          name: g.name,
          members: `${g.count_member} thành viên`,
          posts: `${postCount} bài viết`,
          image: g.thumbnail_url || null,
          isPublic: g.isPublic,
        };
      }),
    );
  }

  async getLatestGroups(userId: number, limit = 5) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      relations: ['group'],
    });

    const joinedGroups = memberships
      .map((m) => m.group)
      .filter((g) => g)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);

    return Promise.all(
      joinedGroups.map(async (g) => {
        const postCount = await this.countPostsByGroup(g.id);
        return {
          id: g.id,
          name: g.name,
          members: `${g.count_member} thành viên`,
          posts: `${postCount} bài viết`,
          image: g.thumbnail_url || null,
          isPublic: g.isPublic,
        };
      }),
    );
  }

  async findGroupsOfUser(userId: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      relations: ['group'],
    });

    const groups = memberships.map((m) => m.group).filter(Boolean);

    return Promise.all(
      groups.map(async (g) => ({
        id: g.id,
        name: g.name,
        memberCount: `${g.count_member}`,
        posts: `${await this.countPostsByGroup(g.id)}`,
        image: g.thumbnail_url || null,
        isPublic: g.isPublic,
      })),
    );
  }

  async findGroupsUserNotJoined(userId?: number) {
    let allGroups = await this.groupRepo.find({
      relations: ['owner', 'members'],
      order: { created_at: 'DESC' },
    });

    if (userId) {
      const joinedIds = await this.groupMemberRepo.find({
        where: { user_id: userId },
        select: ['group_id'],
      });
      const joinedSet = new Set(joinedIds.map((g) => g.group_id));
      allGroups = allGroups.filter((g) => !joinedSet.has(g.id));
    }

    return allGroups.map((g) => ({
      id: g.id,
      name: g.name,
      image: g.thumbnail_url || null,
      memberCount: `${g.count_member}`,
      isPublic: g.isPublic,
    }));
  }

  // ==================== Utilities ====================

  async getUserRole(
    groupId: number,
    userId: number,
  ): Promise<'leader' | 'member' | 'none'> {
    const member = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (!member) return 'none';
    return Number(member.group_role_id) === 2 ? 'leader' : 'member';
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const count = await this.groupMemberRepo.count({
      where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
  }

  private async countPostsByGroup(groupId: number): Promise<number> {
    return this.productRepo.count({ where: { group_id: groupId } });
  }

  // ==================== Group Products ====================

  async getGroupProducts(groupId: number, userId: number) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    const isMember = await this.isMember(groupId, userId);

    if (!group.isPublic && !isMember) {
      throw new ForbiddenException('Bạn cần tham gia nhóm để xem bài viết');
    }

    const products = await this.productRepo.find({
      where: { group_id: groupId, productStatus: { id: 2 } },
      relations: [
        'images',
        'user',
        'category',
        'subCategory',
        'group',
        'postType',
      ],
      order: { created_at: 'DESC' },
      take: 20,
    });

    return products.map((p) => this.formatPost(p));
  }

  async findPostsFromUserGroups(userId: number, limit?: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      select: ['group_id'],
    });

    const groupIds = memberships.map((m) => m.group_id);
    if (!groupIds.length) return [];

    const products = await this.productRepo.find({
      where: {
        group_id: In(groupIds),
        productStatus: { id: 2 },
      },
      relations: ['images', 'user', 'category', 'subCategory', 'group'],
      order: { created_at: 'DESC' },
      take: limit,
    });

    return products.map((p) => this.formatPost(p));
  }

  private formatPost(p: Product) {
    const categoryName = p.category?.name || null;
    const subCategoryName = p.subCategory?.name || null;
    const tag =
      categoryName && subCategoryName
        ? `${categoryName} - ${subCategoryName}`
        : categoryName || subCategoryName || 'Không có danh mục';

    const address =
      typeof p.address_json === 'string'
        ? JSON.parse(p.address_json)
        : p.address_json || {};

    const location =
      address.full ||
      [address.ward, address.district, address.province]
        .filter(Boolean)
        .join(', ') ||
      'Không rõ địa chỉ';

    const images = Array.isArray(p.images)
      ? p.images
          .filter((img) => img && (img.id != null || img.image_url))
          .map((img) => ({
            id: img.id,
            product_id: img.product_id,
            name: img.name,
            image_url: img.image_url,
            created_at: img.created_at,
          }))
      : [];

    const thumbnail_url = p.thumbnail_url || images?.[0]?.image_url || null;

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      thumbnail_url,
      phone: p.user?.phone || null,
      user_id: p.user?.id,
      user: p.user
        ? {
            id: p.user.id,
            name: p.user.fullName,
            email: p.user.email,
            avatar: p.user.image,
            phone: p.user.phone,
          }
        : null,
      postType: p.postType
        ? { id: p.postType.id, name: p.postType.name }
        : null,
      productStatus: p.productStatus
        ? { id: p.productStatus.id, name: p.productStatus.name }
        : null,
      group: p.group
        ? {
            id: p.group_id,
            name: p.group.name,
            image: p.group.thumbnail_url,
          }
        : null,
      images,
      imageCount: images.length,
      location,
      tag,
      created_at: p.created_at,
      updated_at: p.updated_at,
      isFavorite: (p as any).isFavorite ?? false,
    };
  }
}
