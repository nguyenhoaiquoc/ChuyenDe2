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
import { Group } from 'src/entities/group.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,

    @InjectRepository(GroupMember)
    private readonly groupMemberRepo: Repository<GroupMember>,
  ) {}

  // CRUD Groups

  /** Tạo nhóm mới */
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

  /** Xóa nhóm */
  @Delete(':groupId')
  @UseGuards(JwtAuthGuard)
  async deleteGroup(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.deleteGroup(groupId, req.user.id);
    return { success: true, message: 'Xóa nhóm thành công' };
  }

  /** Lấy danh sách bài viết chờ duyệt */
  @Get(':groupId/pending-posts')
  @UseGuards(JwtAuthGuard)
  async getPendingPosts(@Req() req, @Param('groupId') groupId: number) {
    return this.groupService.getPendingPosts(groupId, req.user.id);
  }

  /** Duyệt / từ chối bài viết */
  @Post('posts/:postId/approve')
  @UseGuards(JwtAuthGuard)
  async approvePost(
    @Req() req,
    @Param('postId') postId: number,
    @Body('approve') approve: boolean,
  ) {
    return this.groupService.approvePost(postId, approve, req.user.id);
  }

  // Join / Leave Group

  /** User tham gia nhóm */
  @Post(':groupId/join')
  @UseGuards(JwtAuthGuard)
  async joinGroup(@Req() req, @Param('groupId') groupId: number) {
    const result = await this.groupService.joinGroup(groupId, req.user.id);
    return { success: true, message: 'Tham gia nhóm thành công', result };
  }

  /** User rời nhóm */
  @Delete(':groupId/leave')
  @UseGuards(JwtAuthGuard)
  async leaveGroup(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.leaveGroup(groupId, req.user.id);
    return { success: true, message: 'Rời nhóm thành công' };
  }

  /** Lấy danh sách nhóm mà user tham gia */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getGroups(@Req() req) {
    const userId = req.user.id;
    return this.groupService.findGroupsOfUser(userId);
  }

  /** Lấy nhóm gợi ý cho user (chưa tham gia) */
  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async getSuggestedGroups(@Req() req) {
    const userId = req.user?.id;
    return this.groupService.findGroupsUserNotJoined(userId);
  }

  /** Lấy nhóm mới tham gia (latest) */
  @Get('latest')
  @UseGuards(JwtAuthGuard)
  async getLatestGroups(@Req() req) {
    const userId = req.user.id;
    return this.groupService.getLatestGroups(userId);
  }

  /** Lấy nhóm nổi bật (featured) */
  @Get('featured')
  async getFeaturedGroups() {
    return this.groupService.getFeaturedGroups();
  }

  // Group Role / Membership

  /** Lấy role của user trong nhóm */
  @Get(':groupId/role')
  @UseGuards(JwtAuthGuard)
  async getUserRole(@Req() req, @Param('groupId') groupId: number) {
    const userId = req.user.id;
    const role = await this.groupService.getUserRole(groupId, userId);
    return { role }; // leader | member | none
  }

  /** Kiểm tra user có phải thành viên nhóm không */
  @Get(':groupId/is-member/:userId')
  @UseGuards(JwtAuthGuard)
  async checkMember(
    @Param('groupId') groupId: number,
    @Param('userId') userId: number,
  ) {
    const isMember = await this.groupService.isMember(+groupId, +userId);
    return { groupId, userId, isMember };
  }

  // Group Products

  /** Lấy sản phẩm / bài viết của nhóm */
  @Get(':groupId/products')
  @UseGuards(JwtAuthGuard)
  async getGroupProducts(@Param('groupId') groupId: number, @Req() req) {
    const userId = req.user.id;
    return this.groupService.getGroupProducts(groupId, userId);
  }

  /** Lấy tất cả bài viết từ các nhóm user tham gia */
  @Get('my/group-posts')
  @UseGuards(JwtAuthGuard)
  async getMyGroupPosts(@Req() req, @Query('limit') limit?: number) {
    return this.groupService.findPostsFromUserGroups(req.user.id, limit);
  }

  // Upload Group Image

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', CloudinaryMulter))
  async uploadGroupImage(@UploadedFile() file: Express.Multer.File) {
    return { url: file?.path }; // secure_url từ Cloudinary
  }
}
