import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }
  
 

@Post('reset-password')
async resetPassword(@Body() body: ResetPasswordDto) {
  // ValidationPipe sẽ chạy trên toàn bộ DTO
  return this.authService.resetPasswordWithDto(body);
}


  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }
  @Post('verify-reset-otp')
async verifyResetOtp(@Body() body: { email: string; otp: string }) {
  return this.authService.verifyResetOtp(body.email, body.otp);
}
}
