<<<<<<< HEAD
import { Controller, Post, Body } from '@nestjs/common';
=======
import { Controller, Post, Body, Get } from '@nestjs/common';
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
<<<<<<< HEAD
  constructor(private readonly authService: AuthService) {}
=======
  constructor(private readonly authService: AuthService) { }

  @Get()
  async getUsers() {
    return this.authService.getUsers();
  }
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

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
<<<<<<< HEAD
  
 

@Post('reset-password')
async resetPassword(@Body() body: ResetPasswordDto) {
  // ValidationPipe sẽ chạy trên toàn bộ DTO
  return this.authService.resetPasswordWithDto(body);
}

=======

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    // ValidationPipe sẽ chạy trên toàn bộ DTO
    return this.authService.resetPasswordWithDto(body);
  }
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }
  @Post('verify-reset-otp')
<<<<<<< HEAD
async verifyResetOtp(@Body() body: { email: string; otp: string }) {
  return this.authService.verifyResetOtp(body.email, body.otp);
}
=======
  async verifyResetOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyResetOtp(body.email, body.otp);
  }
>>>>>>> 643951d52935fb80b158e072f4e9d26056271064
}
