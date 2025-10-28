import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { GroupMember } from 'src/entities/group-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  @Get()
  async getGroups() {
    const groups = await this.groupService.findAll();
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: `${g.count_member} thành viên`,
      posts: 'Chưa có dữ liệu bài viết', // sau này nối thêm 
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
    }));
  }

  @Get('latest')
  async getLatestGroups() {
    const groups = await this.groupService.findAll({ take: 5 });
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: `${g.count_member} thành viên`,
      posts: 'Chưa có dữ liệu bài viết',
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
    }));
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', CloudinaryMulter))
  async uploadGroupImage(@UploadedFile() file: Express.Multer.File) {
    console.log('📤 Ảnh nhóm đã upload:', file?.path);
    return { url: file?.path }; // ✅ secure_url từ Cloudinary
  }

  // Tạo nhóm
  @Post()
  async createGroup(@Body() body: any) {
    const group = await this.groupService.create(body);

    return {
      id: group.id,
      name: group.name,
      isPublic: group.isPublic,
      members: group.count_member,
      posts: 'Chưa có dữ liệu bài viết',
      image: group.thumbnail_url,
      owner: group.owner_id,
      createdAt: group.created_at,
    };
  }

  // Check user có trong group không
  @Get(':groupId/is-member/:userId')
  async checkMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    const isMember = await this.groupService.isMember(+groupId, +userId);
    return { groupId, userId, isMember };
  }

  // User vào group
  @Post(':groupId/join/:userId')
  async joinGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<GroupMember> {
    return this.groupService.joinGroup(+groupId, +userId);
  }

  // User leave group
  @Delete(':groupId/leave/:userId')
  async leaveGroup(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ): Promise<{ success: boolean }> {
    await this.groupService.leaveGroup(+groupId, +userId);
    return { success: true };
  }

  @Get('users/:userId/group-posts')
  async getGroupPosts(
    @Param('userId') userId: number,
    @Query('limit') limit?: number,
  ) {
    return this.groupService.findPostsFromUserGroups(
      +userId,
      limit ? +limit : undefined,
    );
  }
}
