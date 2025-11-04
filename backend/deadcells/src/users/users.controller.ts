import {
  Controller,
  ParseIntPipe ,
  Get,
  Patch,
  Post,
  Req,
  
  UploadedFile,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileFieldsInterceptor,FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { User } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lấy thông tin user
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // Cập nhật user (sửa info, upload ảnh, xoá ảnh)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
      },
    ),
  )
  async updateUser(
    @Param('id') id: string,
    @Body() data: Partial<User>,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      coverImage?: Express.Multer.File[];
    },
  ) {
    const updateData: Partial<User> = { ...data };

    // Xử lý file upload
    if (files) {
      if (files.image && files.image[0]) {
        updateData.image = files.image[0].path;
      }
      if (files.coverImage && files.coverImage[0]) {
        updateData.coverImage = files.coverImage[0].path;
      }
    }

    // Kiểm tra có dữ liệu để update không
    if (Object.keys(updateData).length === 0 && (!files || Object.keys(files).length === 0)) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    return this.usersService.updateUser(+id, updateData);
  }
}
    // Update thông tin sinh viên từ QR hoặc FormData
 
