import {
  Controller,
  Get,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Query,
  Post,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Req() req, @Query('q') search?: string) {
    const currentUserId = req.user.id;
    return this.usersService.searchUsersForInvite(currentUserId, search);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Cập nhật avatar
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', CloudinaryMulter))
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return { error: 'Chưa chọn file' };
    return this.usersService.updateUser(+id, { image: file.path });
  }

  // Cập nhật cover (giả sử cột coverImage trong DB)
  @Patch(':id/cover')
  @UseInterceptors(FileInterceptor('coverImage', CloudinaryMulter))
  async updateCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return { error: 'Chưa chọn file' };
    return this.usersService.updateUser(+id, { coverImage: file.path });
  }

  /** Đánh giá user */
  @Post(':userId/rate')
  @UseGuards(JwtAuthGuard)
  async rateUser(
    @Req() req,
    @Param('userId') userId: number,
    @Body() data: { stars: number; content?: string },
  ) {
    return this.usersService.rateUser(
      req.user.id,
      userId,
      data.stars,
      data.content,
    );
  }

  /** Lấy danh sách đánh giá của user */
  @Get(':userId/ratings')
  async getUserRatings(@Param('userId') userId: number) {
    return this.usersService.getUserRatings(userId);
  }

  /** Lấy rating trung bình */
  @Get(':userId/rating-average')
  async getUserAverageRating(@Param('userId') userId: number) {
    return this.usersService.getUserAverageRating(userId);
  }

  /** Kiểm tra đã đánh giá chưa */
  @Get(':userId/check-rating')
  @UseGuards(JwtAuthGuard)
  async checkUserRating(@Req() req, @Param('userId') userId: number) {
    return this.usersService.checkUserRating(req.user.id, userId);
  }

  @Delete(':userId/rate')
  @UseGuards(JwtAuthGuard)
  async deleteRating(@Req() req, @Param('userId') userId: number) {
    return this.usersService.deleteRating(req.user.id, userId);
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  async getMyRatings(@Req() req) {
    return this.usersService.getMyRatings(req.user.id);
  }
}
