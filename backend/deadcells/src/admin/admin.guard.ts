
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Log để debug nhanh (sau này có thể xóa)
    console.log('AdminGuard → user:', user);


    if (!user || Number(user.roleId) !== 1) {
      throw new ForbiddenException('Chỉ Admin mới có quyền truy cập');
    }
    return true;
  }
}