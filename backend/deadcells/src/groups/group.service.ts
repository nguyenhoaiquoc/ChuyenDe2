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

    // @InjectRepository(GroupMember)
    // private readonly groupMemberRepo: Repository<GroupMember>, 

    // @InjectRepository(Product)
    // private readonly productRepo: Repository<Product>, 

    // private readonly productService: ProductService,
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
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['members'],
    });
    if (!group) return false;
    return group.members.some((m) => m.user_id === userId);
  }

  // //  User vào group
  // async joinGroup(groupId: number, userId: number, roleId = 2): Promise<GroupMember> {
  //   const exists = await this.groupMemberRepo.findOne({
  //     where: { group_id: groupId, user_id: userId },
  //   });
  //   if (exists) return exists;

  //   const member = this.groupMemberRepo.create({
  //     group_id: groupId,
  //     user_id: userId,
  //     group_role_id: 1,
  //   });
  //   return this.groupMemberRepo.save(member);
  // }


  // //  User rời group
  // async leaveGroup(groupId: number, userId: number): Promise<void> {
  //   await this.groupMemberRepo.delete({ group_id: groupId, user_id: userId });
  // }


//  async findPostsFromUserGroups(userId: number, limit?: number) {
//   const memberships = await this.groupMemberRepo.find({
//     where: { user_id: userId },
//   });
//   const groupIds = memberships.map(m => m.group_id);

//   if (groupIds.length === 0) return [];

//   const posts = await this.productRepo.find({
//     where: { group_id: In(groupIds), status_id: 1 },
//     order: { created_at: 'DESC' },
//     take: limit || undefined,
//     relations: [
//       'images','user','dealType','condition','category','subCategory',
//       'postType','productType',
//     ],
//   });

//   return posts.map(p => this.productService.formatProducts(p));
// }
  
}
