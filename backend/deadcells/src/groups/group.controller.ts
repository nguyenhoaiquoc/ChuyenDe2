import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { GroupMember } from 'src/entities/group-member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/entities/product.entity';
import { Group } from 'src/entities/group.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  // Lấy danh sách nhóm mà user đã tham gia
  @Get()
  @UseGuards(JwtAuthGuard)
  async getGroups(@Req() req) {
    const userId = req.user.id;
    const groups = await this.groupService.findGroupsOfUser(userId);

    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: `${g.count_member} thành viên`,
      posts: 'Chưa có dữ liệu bài viết',
      image: g.thumbnail_url?.startsWith('http') ? g.thumbnail_url : null,
    }));
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async getSuggestedGroups(@Req() req) {
    const userId = req.user?.id;

    return this.groupService.findGroupsUserNotJoined(userId);
  }

  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatestGroups(@Req() req) {
    const userId = req.user.id;
    return this.groupService.getLatestGroups(userId);
  }

  @Get('featured')
  async getFeaturedGroups() {
    return this.groupService.getFeaturedGroups();
  }

  @Get(':groupId/products')
  @UseGuards(JwtAuthGuard)
  async getGroupProducts(@Param('groupId') groupId: number, @Req() req) {
    const userId = req.user.id;
    return this.groupService.getGroupProducts(groupId, userId);
  }
  
  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', CloudinaryMulter))
  async uploadGroupImage(@UploadedFile() file: Express.Multer.File) {
    console.log(' Ảnh nhóm đã upload:', file?.path);
    return { url: file?.path }; // ✅ secure_url từ Cloudinary
  }

  // Tạo nhóm
  @Post()
  @UseGuards(JwtAuthGuard)
  async createGroup(@Req() req, @Body() data: Partial<Group>) {
    const userId = req.user.id;
    const group = await this.groupService.create(data, userId);

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
  @UseGuards(JwtAuthGuard)
  async checkMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    const isMember = await this.groupService.isMember(+groupId, +userId);
    return { groupId, userId, isMember };
  }

  // vào nhóm
  @Post(':groupId/join')
  @UseGuards(JwtAuthGuard)
  async joinGroup(@Req() req, @Param('groupId') groupId: number) {
    return this.groupService.joinGroup(groupId, req.user.id);
  }

  // rời nhóm
  @Delete(':groupId/leave')
  @UseGuards(JwtAuthGuard)
  async leaveGroup(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.leaveGroup(groupId, req.user.id);
    return { success: true };
  }

  // Lấy bài viết từ các nhóm user đã tham gia
  @Get('my/group-posts')
  @UseGuards(JwtAuthGuard)
  async getMyGroupPosts(@Req() req, @Query('limit') limit?: number) {
    return this.groupService.findPostsFromUserGroups(req.user.id, limit);
  }
}
