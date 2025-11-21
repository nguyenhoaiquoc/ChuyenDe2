import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'; // ← THÊM DÒNG NÀY
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService, // ← THÊM SERVICE ĐỂ LẤY USER TỪ DB
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Lấy token như cũ
    const authHeader: string = req.headers?.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
    if (!token) token = (req.query?.token as string) || req.cookies?.access_token;

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = this.jwtService.verify(token);

      // LẤY USER THẬT TỪC TỪ DB (để có roleId chính xác)
      const user = await this.usersService.findOne(payload.sub || payload.id);

      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      // GÁN ĐÚNG req.user VỚI DỮ LIỆU TỪ DB → roleId SẼ CÓ!!!
      req.user = {
        id: user.id,
        email: user.email,
        roleId: user.roleId, 
      };

      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}