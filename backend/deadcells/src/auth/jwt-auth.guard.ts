import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // HTTP only (controller). WS bạn đã verify trong Gateway rồi.
    const req = context.switchToHttp().getRequest();

    // Ưu tiên: Authorization: Bearer <token>
    const authHeader: string = req.headers?.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();

    // Fallback: query ?token=... hoặc cookie access_token
    if (!token) token = (req.query?.token as string) || req.cookies?.access_token;

    if (!token) throw new UnauthorizedException('Missing access token');

    try {
      const payload = this.jwtService.verify(token); // dùng secret đã cấu hình trong JwtModule
      // Gắn user cho request để controller/service dùng
      req.user = {
        id: payload.sub ?? payload.id,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
