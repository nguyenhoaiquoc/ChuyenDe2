import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  UploadedFile, 
  UseInterceptors,
  Body // <<< 1. THÊM @Body VÀO IMPORT
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { User } from 'src/entities/user.entity'; // <<< 2. (Có thể) bạn cần import User

@Controller('users')
export class UsersController {
 constructor(private readonly usersService: UsersService) {}

 @Get(':id')
 async getUser(@Param('id') id: string) {
return this.usersService.findOne(+id);
 }

  // --- 3. THÊM HÀM MỚI NÀY ĐỂ CẬP NHẬT THÔNG TIN ---
  @Patch(':id/info') // Dùng route mới, ví dụ /:id/info
  async updateInfo(
    @Param('id') id: string,
    @Body() data: Partial<User>, // <<< Dùng @Body() để nhận JSON
  ) {
    // KHÔNG dùng FileInterceptor ở đây
    // Giờ hàm này sẽ gọi service và lưu data (fullName, phone,...)
    return this.usersService.updateUser(+id, data);
  }
  // -------------------------------------------------

  // 4. SỬA LẠI HÀM CŨ (chỉ để up avatar)
  @Patch(':id/avatar') // <<< Đổi route thành /:id/avatar
  @UseInterceptors(FileInterceptor('image', CloudinaryMulter))
  async updateAvatar(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) return { error: 'Chưa chọn file' };
    // Hàm này giờ chỉ cập nhật ảnh
    return this.usersService.updateUser(+id, { image: file.path });
  }

  // Cập nhật cover (giữ nguyên)
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