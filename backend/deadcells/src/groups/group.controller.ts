import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

  // ==================== CRUD Groups ====================

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
      posts: 'Chưa có dữ liệu bài viết',
      image: group.thumbnail_url,
      owner: group.owner_id,
      createdAt: group.created_at,
    };
  }

  /** Sửa thông tin nhóm */
  @Patch(':groupId')
  @UseGuards(JwtAuthGuard)
  async updateGroup(
    @Req() req,
    @Param('groupId') groupId: number,
    @Body()
    data: {
      name?: string;
      description?: string;
      thumbnail_url?: string;
      mustApprovePosts?: boolean;
    },
  ) {
    const group = await this.groupService.updateGroup(
      groupId,
      req.user.id,
      data,
    );
    return {
      success: true,
      message: 'Cập nhật thông tin nhóm thành công',
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        image: group.thumbnail_url,
        mustApprovePosts: group.mustApprovePosts,
        isPublic: group.isPublic,
      },
    };
  }

  /** Xóa nhóm */
  @Delete(':groupId')
  @UseGuards(JwtAuthGuard)
  async deleteGroup(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.deleteGroup(groupId, req.user.id);
    return { success: true, message: 'Xóa nhóm thành công' };
  }

  // ==================== Duyệt Bài Viết ====================

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

  // ==================== Quản Lý Thành Viên ====================

  /** Lấy danh sách thành viên (pending = 3) */
  @Get(':groupId/members')
  @UseGuards(JwtAuthGuard)
  async getMembers(@Req() req, @Param('groupId') groupId: number) {
    return this.groupService.getMembers(groupId, req.user.id);
  }

  /** Lấy danh sách yêu cầu tham gia chờ duyệt (pending = 2) */
  @Get(':groupId/pending-members')
  @UseGuards(JwtAuthGuard)
  async getPendingMembers(@Req() req, @Param('groupId') groupId: number) {
    return this.groupService.getPendingMembers(groupId, req.user.id);
  }

  /** Duyệt thành viên (pending: 2 → 3) */
  @Post(':groupId/members/:targetUserId/approve')
  @UseGuards(JwtAuthGuard)
  async approveMember(
    @Req() req,
    @Param('groupId') groupId: number,
    @Param('targetUserId') targetUserId: number,
    @Body('approve') approve: boolean,
  ) {
    return this.groupService.approveMember(
      groupId,
      targetUserId,
      approve,
      req.user.id,
    );
  }

  /** Xóa thành viên khỏi nhóm */
  @Delete(':groupId/members/:userId')
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @Req() req,
    @Param('groupId') groupId: number,
    @Param('userId') targetUserId: number,
  ) {
    await this.groupService.removeMember(groupId, targetUserId, req.user.id);
    return { success: true, message: 'Đã xóa thành viên khỏi nhóm' };
  }

  /** Chuyển quyền trưởng nhóm */
  @Post(':groupId/transfer-leadership')
  @UseGuards(JwtAuthGuard)
  async transferLeadership(
    @Req() req,
    @Param('groupId') groupId: number,
    @Body('newLeaderId') newLeaderId: number,
  ) {
    await this.groupService.transferLeadership(
      groupId,
      newLeaderId,
      req.user.id,
    );
    return { success: true, message: 'Đã chuyển quyền trưởng nhóm thành công' };
  }

  // ==================== Quản Lý Nội Dung ====================

  /** Thống kê bài viết của user trong nhóm */
  @Get(':groupId/my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPostsInGroup(@Req() req, @Param('groupId') groupId: number) {
    return this.groupService.getMyPostsInGroup(groupId, req.user.id);
  }

  // ==================== Join / Leave Group ====================

  /**
   * User tham gia nhóm
   * - Public: pending = 3 (joined ngay)
   * - Private: pending = 2 (chờ duyệt)
   */
  @Post(':groupId/join')
  @UseGuards(JwtAuthGuard)
  async joinGroup(@Req() req, @Param('groupId') groupId: number) {
    const result = await this.groupService.joinGroup(groupId, req.user.id);
    return result;
  }

  /** Hủy yêu cầu tham gia (xóa pending = 2) */
  @Delete(':groupId/join-request')
  @UseGuards(JwtAuthGuard)
  async cancelJoinRequest(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.cancelJoinRequest(groupId, req.user.id);
    return { success: true, message: 'Đã hủy yêu cầu tham gia' };
  }

  /** User rời nhóm (xóa pending = 3) */
  @Delete(':groupId/leave')
  @UseGuards(JwtAuthGuard)
  async leaveGroup(@Req() req, @Param('groupId') groupId: number) {
    await this.groupService.leaveGroup(groupId, req.user.id);
    return { success: true, message: 'Rời nhóm thành công' };
  }

  // ==================== Get/List Groups ====================

  /** Lấy danh sách nhóm mà user tham gia (pending = 3) */
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



  // ==================== Group Role / Membership ====================

  /** Lấy trạng thái tham gia nhóm (none/pending/joined) */
  @Get(':groupId/join-status')
  @UseGuards(JwtAuthGuard)
  async getJoinStatus(@Req() req, @Param('groupId') groupId: number) {
    const userId = req.user.id;
    const status = await this.groupService.getJoinStatus(groupId, userId);
    return { status };
  }

  /** Lấy role của user trong nhóm (chỉ pending = 3) */
  @Get(':groupId/role')
  @UseGuards(JwtAuthGuard)
  async getUserRole(@Req() req, @Param('groupId') groupId: number) {
    const userId = req.user.id;
    const role = await this.groupService.getUserRole(groupId, userId);
    return { role };
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

  // ==================== Group Products ====================

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

  // ==================== Upload Group Image ====================

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', CloudinaryMulter))
  async uploadGroupImage(@UploadedFile() file: Express.Multer.File) {
    return { url: file?.path };
  }
 @Get('public')
 async findPublic() {
  return this.groupService.findAllPublic(true);
}


}
