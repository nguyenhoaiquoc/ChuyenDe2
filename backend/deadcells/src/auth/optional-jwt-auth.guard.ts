import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalJwtAuthGuard {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    const authHeader: string = req.headers?.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();

    if (!token)
      token = (req.query?.token as string) || req.cookies?.access_token;

    if (!token) {
      req.user = null;
      return true;
    }

    try {
      const payload = this.jwtService.verify(token);
      req.user = {
        id: payload.sub ?? payload.id,
        email: payload.email,
        role: payload.role,
      };
    } catch (e) {
      req.user = null;
    }

    return true;
  }
}
