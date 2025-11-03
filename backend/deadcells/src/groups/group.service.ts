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

  // CRUD Groups

  /** Tạo nhóm mới */
  async create(data: Partial<Group>, userId: number): Promise<Group> {
    const group = this.groupRepo.create({
      name: data.name,
      isPublic: data.isPublic ?? true,
      thumbnail_url: data.thumbnail_url || undefined,
      owner_id: userId,
      count_member: 1,
      status_id: 1, // Hoạt động
    });
    const savedGroup = await this.groupRepo.save(group);

    // Tạo bản ghi leader trong group_members
    const member = this.groupMemberRepo.create({
      group_id: savedGroup.id,
      user_id: userId,
      group_role_id: 2, // 2 = leader
    });
    await this.groupMemberRepo.save(member);

    return savedGroup;
  }

  /** Xóa nhóm */
  async deleteGroup(groupId: number, userId: number): Promise<void> {
    const role = await this.getUserRole(groupId, userId);
    if (role !== 'leader') {
      throw new ForbiddenException('Bạn không có quyền xóa nhóm này');
    }

    // Xóa các liên quan: members, products
    await this.groupMemberRepo.delete({ group_id: groupId });
    await this.productRepo.delete({ group_id: groupId });

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    await this.groupRepo.remove(group);
  }

  /** Lấy tất cả nhóm (tùy chọn filter/take) */
  async findAll(options?: FindManyOptions<Group>): Promise<Group[]> {
    return this.groupRepo.find({
      relations: ['owner', 'status', 'members'],
      order: { created_at: 'DESC' },
      ...options,
    });
  }

  // Join/Leave Group

  /** User tham gia nhóm */
  async joinGroup(groupId: number, userId: number): Promise<GroupMember> {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Nhóm không tồn tại');

    const exists = await this.groupMemberRepo.findOne({
      where: { group_id: groupId, user_id: userId },
    });
    if (exists) throw new BadRequestException('Bạn đã là thành viên');

    const member = this.groupMemberRepo.create({
      group_id: groupId,
      user_id: userId,
      group_role_id: 1, // 1 = member
    });
    const saved = await this.groupMemberRepo.save(member);

    // Tăng số lượng thành viên
    await this.groupRepo.increment({ id: groupId }, 'count_member', 1);
    return saved;
  }

  /** User rời nhóm */
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

  // Get/List Groups

  /** Lấy nhóm nổi bật (top theo số member) */
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

  /** Lấy nhóm mới tham gia của user */
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

  /** Lấy tất cả nhóm user đã tham gia */
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

  /** Lấy các nhóm user chưa tham gia */
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

  // Role & Membership Utilities

  /** Kiểm tra role user trong nhóm */
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

  /** Kiểm tra user có phải thành viên nhóm */
  async isMember(groupId: number, userId: number): Promise<boolean> {
    const count = await this.groupMemberRepo.count({
      where: { group_id: groupId, user_id: userId },
    });
    return count > 0;
  }

  /** Đếm số bài viết trong nhóm */
  private async countPostsByGroup(groupId: number): Promise<number> {
    return this.productRepo.count({ where: { group_id: groupId } });
  }

  // Group Products

  /** Lấy danh sách sản phẩm của nhóm (kiểm tra quyền) */
  async getGroupProducts(groupId: number, userId: number) {
    const isMember = await this.isMember(groupId, userId);
    if (!isMember)
      throw new ForbiddenException('Bạn không phải thành viên nhóm');

    const products = await this.productRepo.find({
      where: { group_id: groupId },
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

  /** Lấy bài viết từ các nhóm user tham gia */
  async findPostsFromUserGroups(userId: number, limit?: number) {
    const memberships = await this.groupMemberRepo.find({
      where: { user_id: userId },
      select: ['group_id'],
    });

    const groupIds = memberships.map((m) => m.group_id);
    if (!groupIds.length) return [];

    const products = await this.productRepo.find({
      where: { group_id: In(groupIds) },
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
        : categoryName ||
          subCategoryName ||
          p.dealType?.name ||
          'Không có danh mục';

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
      author_name: p.user?.fullName || 'Người bán',
      author: p.author || null,
      year: p.year || null,
      mileage: p.mileage ?? null,

      postType: p.postType
        ? { id: p.postType.id, name: p.postType.name }
        : null,
      productType: p.productType
        ? { id: p.productType.id, name: p.productType.name }
        : null,
      origin: p.origin ? { id: p.origin.id, name: p.origin.name } : null,
      material: p.material
        ? { id: p.material.id, name: p.material.name }
        : null,
      size: p.size ? { id: p.size.id, name: p.size.name } : null,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name } : null,
      color: p.color ? { id: p.color.id, name: p.color.name } : null,
      capacity: p.capacity
        ? { id: p.capacity.id, name: p.capacity.name }
        : null,
      warranty: p.warranty
        ? { id: p.warranty.id, name: p.warranty.name }
        : null,
      productModel: p.productModel
        ? { id: p.productModel.id, name: p.productModel.name }
        : null,
      processor: p.processor
        ? { id: p.processor.id, name: p.processor.name }
        : null,
      ramOption: p.ramOption
        ? { id: p.ramOption.id, name: p.ramOption.name }
        : null,
      storageType: p.storageType
        ? { id: p.storageType.id, name: p.storageType.name }
        : null,
      graphicsCard: p.graphicsCard
        ? { id: p.graphicsCard.id, name: p.graphicsCard.name }
        : null,
      breed: p.breed ? { id: p.breed.id, name: p.breed.name } : null,
      ageRange: p.ageRange
        ? { id: p.ageRange.id, name: p.ageRange.name }
        : null,
      gender: p.gender ? { id: p.gender.id, name: p.gender.name } : null,
      engineCapacity: p.engineCapacity
        ? { id: p.engineCapacity.id, name: p.engineCapacity.name }
        : null,
      productStatus: p.productStatus
        ? { id: p.productStatus.id, name: p.productStatus.name }
        : null,

      dealType: p.dealType
        ? { id: p.dealType.id, name: p.dealType.name }
        : null,
      condition: p.condition
        ? { id: p.condition.id, name: p.condition.name }
        : null,

      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            image: p.category.image,
            hot: p.category.hot,
          }
        : null,
      subCategory: p.subCategory
        ? {
            id: p.subCategory.id,
            name: p.subCategory.name,
            parent_category_id: p.subCategory.parent_category_id,
            source_table: p.subCategory.source_table,
            source_id: p.subCategory.source_id,
          }
        : null,

      category_change: p.category_change
        ? {
            id: p.category_change.id,
            name: p.category_change.name,
            image: p.category_change.image,
          }
        : null,
      sub_category_change: p.sub_category_change
        ? {
            id: p.sub_category_change.id,
            name: p.sub_category_change.name,
            parent_category_id: p.sub_category_change.parent_category_id,
            source_table: p.sub_category_change.source_table,
            source_id: p.sub_category_change.source_id,
          }
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

      deal_type_id: p.deal_type_id,
      category_id: p.category_id,
      sub_category_id: p.sub_category_id,
      category_change_id: p.category_change_id,
      sub_category_change_id: p.sub_category_change_id,
      status_id: p.status_id,
      visibility_type: p.visibility_type,
      is_approved: p.is_approved,

      address_json: p.address_json,
      location,
      tag,
      created_at: p.created_at,
      updated_at: p.updated_at,
      isFavorite: (p as any).isFavorite ?? false,
    };
  }
}
