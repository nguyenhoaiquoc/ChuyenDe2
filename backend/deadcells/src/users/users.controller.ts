import { format, isValid, parseISO } from 'date-fns';
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
  UnauthorizedException,
  ForbiddenException,
  Logger,
  Query,
  Delete,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { User } from 'src/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CloudinaryMulter } from 'src/cloudinary/cloudinary.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Lấy thông tin user theo ID
   */
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async searchUsers(@Req() req, @Query('q') search?: string) {
    const currentUserId = req.user.id;
    return this.usersService.searchUsersForInvite(currentUserId, search);
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  async getMyRatings(@Req() req) {
    return this.usersService.getMyRatings(req.user.id);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  /**
   * Cập nhật thông tin user (profile, avatar, cover image)
   */
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() data: { image?: string; coverImage?: string },
  ) {
    // Nếu không có dữ liệu gì gửi lên
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Không có dữ liệu để cập nhật');
    }

    // Gọi service để cập nhật user
    return this.usersService.updateUser(+id, data);
  }

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
      verified: user.is_cccd_verified,
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
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${userId}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return cb(
            new BadRequestException('Chỉ chấp nhận file ảnh JPG/PNG'),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async verifyCCCD(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('parsed') parsedString: string,
    @Req() req: any,
  ) {
    if (!req.user)
      throw new UnauthorizedException('Token không hợp lệ hoặc không có user');
    const userId = req.user.id;
    this.logger.log(`User ${userId} đang xác thực CCCD...`);

    // Parse JSON
    let parsed: any = {};
    try {
      parsed =
        typeof parsedString === 'string'
          ? JSON.parse(parsedString)
          : parsedString || {};
    } catch (e) {
      throw new BadRequestException(
        'Dữ liệu CCCD không hợp lệ (JSON parse error)',
      );
    }

    if ((!parsed || Object.keys(parsed).length === 0) && !file) {
      throw new BadRequestException('Cần cung cấp dữ liệu CCCD hoặc ảnh CCCD');
    }

    // Xử lý DOB
    let dob: string | undefined = undefined;
    if (parsed.dob) {
      if (/^\d{8}$/.test(parsed.dob)) {
        const day = parsed.dob.slice(0, 2);
        const month = parsed.dob.slice(2, 4);
        const year = parsed.dob.slice(4, 8);
        dob = `${year}-${month}-${day}`;
      } else {
        const dateObj = parseISO(parsed.dob);
        if (isValid(dateObj)) dob = format(dateObj, 'yyyy-MM-dd');
      }
    }

    // Chuẩn bị dữ liệu CCCD
    const cccdData = {
      fullName: parsed.fullName || undefined,
      citizenId: parsed.citizenId || undefined,
      gender: parsed.gender || undefined,
      dob: dob,
      hometown: parsed.hometown || undefined,
      address: parsed.address || undefined,
      imageUrl: file ? `/uploads/cccd/${file.filename}` : undefined,
    };

    const user = await this.usersService.findOne(userId);

    try {
      // Nếu user chưa verified và chưa pending => xác thực trực tiếp
      if (!user.is_cccd_verified && !user.cccd_pending_data) {
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
            verified: updated.is_cccd_verified,
            verifiedAt: updated.verifiedAt,
            image: updated.image,
          },
        };
      } else {
        // Lần 2 trở đi: tạo pending chờ admin duyệt
        const pendingData = { ...cccdData, submittedAt: new Date() };
        const updated = await this.usersService.saveCCCDPending(
          userId,
          pendingData,
        );
        this.logger.log(`User ${userId} gửi CCCD chờ admin duyệt.`);
        return {
          success: true,
          message: 'Thông tin CCCD của bạn đang chờ admin duyệt',
          user: {
            id: updated.id,
            verified: updated.is_cccd_verified,
            pending: !!updated.cccd_pending_data,
            submittedAt: updated.cccd_pending_data?.submittedAt,
          },
        };
      }
    } catch (error) {
      this.logger.error(`Lỗi xác thực CCCD cho user ${userId}:`, error);
      throw error;
    }
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
}
