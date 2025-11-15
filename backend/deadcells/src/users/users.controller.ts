import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Lấy thông tin user theo ID
   */
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * Cập nhật thông tin user (profile, avatar, cover image)
   */
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
          filename: (_, file, cb) => {
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

    if (files) {
      if (files.image && files.image[0]) updateData.image = files.image[0].path;
      if (files.coverImage && files.coverImage[0]) updateData.coverImage = files.coverImage[0].path;
    }

    if (Object.keys(updateData).length === 0 && (!files || Object.keys(files).length === 0)) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    return this.usersService.updateUser(+id, updateData);
  }

  /**
   * ✅ Xác thực CCCD/CMND - Scan QR hoặc upload ảnh
   * Route: POST /users/verify-cccd
   * Header: Authorization: Bearer {token}
   * Body (FormData):
   *   - citizenCard: File (ảnh CCCD)
   *   - parsed: JSON string (dữ liệu đã parse từ QR)
   */
  @Get(':id/verify-cccd')
@UseGuards(AuthGuard('jwt'))
async getCCCDInfo(@Param('id') id: string, @Req() req: any) {
  const userId = req.user.id;

  // Chỉ cho phép user xem CCCD của chính họ
  if (Number(id) !== userId) {
    throw new ForbiddenException('Không thể xem CCCD của người khác');
  }

  const user = await this.usersService.findOne(userId);

  return {
    citizenId: user.citizenId || null,
    fullName: user.fullName || null,
    gender: user.gender || null,
    dob: user.dob || null,
    hometown: user.hometown || null,
    address: user.address_json || null,
    image: user.image || null,
    verified: user.is_verified,
    verifiedAt: user.verifiedAt,
  };
}
  @Post(':id/verify-cccd')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('citizenCard', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(__dirname, '..', '..', 'uploads', 'cccd');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const userId = (req as any).user?.id || 'unknown';
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${userId}-${uniqueSuffix}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(new BadRequestException('Chỉ chấp nhận file ảnh JPG/PNG'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Max 5MB
      },
    }),
  )
  async verifyCCCD(
    @UploadedFile() file: Express.Multer.File,
    @Body('parsed') parsedString: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    this.logger.log(`User ${userId} đang xác thực CCCD...`);

    // ✅ Parse dữ liệu từ QR/form
    let parsed: any = {};
    try {
      parsed = typeof parsedString === 'string' 
        ? JSON.parse(parsedString) 
        : parsedString || {};
    } catch (e) {
      this.logger.error('Parse JSON error:', e);
      throw new BadRequestException('Dữ liệu CCCD không hợp lệ (JSON parse error)');
    }

    // ✅ Validate: Phải có ít nhất 1 trong 2 (dữ liệu hoặc ảnh)
    if ((!parsed || Object.keys(parsed).length === 0) && !file) {
      throw new BadRequestException('Cần cung cấp dữ liệu CCCD hoặc ảnh CCCD');
    }

    // ✅ Chuẩn bị dữ liệu để gửi vào service
    const cccdData = {
      fullName: parsed.fullName || undefined,
      citizenId: parsed.citizenId || undefined,
      gender: parsed.gender || undefined,
      dob: parsed.dob || undefined,
      hometown: parsed.placeOfOrigin || undefined,
      address: parsed.address || undefined,
      imageUrl: file ? `/uploads/cccd/${file.filename}` : undefined,
    };

    // ✅ Gọi service xử lý
    try {
      const updated = await this.usersService.verifyCCCD(userId, cccdData);

      this.logger.log(`User ${userId} xác thực CCCD thành công!`);

      return {
        success: true,
        message: 'Xác thực CCCD thành công ✅',
        user: {
          id: updated.id,
          fullName: updated.fullName,
          citizenId: updated.citizenId,
          gender: updated.gender,
          dob: updated.dob,
          hometown: updated.hometown,
          verified: updated.is_verified,
          verifiedAt: updated.verifiedAt,
          image: updated.image,
        },
      };
    } catch (error) {
      this.logger.error(`Lỗi xác thực CCCD cho user ${userId}:`, error);
      
      // ✅ Xóa file đã upload nếu có lỗi
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      throw error; // Re-throw để NestJS xử lý
    }
  }
}