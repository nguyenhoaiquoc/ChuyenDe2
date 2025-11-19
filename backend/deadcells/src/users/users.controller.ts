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
}
