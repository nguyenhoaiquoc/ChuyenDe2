import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { OtpVerification } from 'src/entities/otp-verification.entity';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OtpVerification)
    private readonly otpRepository: Repository<OtpVerification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }


  async getUsers() {
    return await this.userRepository.find();
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      phone: dto.phone,
      roleId: 2,
    });
    await this.userRepository.save(user);

    // Tạo OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 5 số
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 phút

    const otpEntity = this.otpRepository.create({
      user,
      otp,
      expires_at: expiresAt,
    });
    await this.otpRepository.save(otpEntity);

    // Gửi mail
    await this.mailService.sendOTP(user.email, otp);

    return { message: 'Đăng ký thành công. OTP đã được gửi về email' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const otpRecord = await this.otpRepository.findOne({
      where: { user: { id: user.id }, otp, used: false },
      order: { created_at: 'DESC' },
    });
    if (!otpRecord) throw new BadRequestException('OTP không hợp lệ');
    if (otpRecord.expires_at < new Date()) throw new BadRequestException('OTP đã hết hạn');

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    return { message: 'Xác thực thành công' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role', 'status'], // load role
    });

    if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const payload = { id: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { token, role: user.role.name, fullName: user.fullName, };
  }

  // --- Gửi OTP quên mật khẩu ---
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 phút

    const otpEntity = this.otpRepository.create({
      user,
      otp,
      expires_at: expiresAt,
      type: 'reset', // phân biệt OTP reset mật khẩu
    });

    await this.otpRepository.save(otpEntity);

    // Gửi OTP qua email
    await this.mailService.sendOTP(user.email, otp);

    return { message: 'OTP đã được gửi về email' };
  }

  // --- Verify OTP quên mật khẩu ---
  async verifyResetOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email không tồn tại');

    const otpRecord = await this.otpRepository.findOne({
      where: { user: { id: user.id }, otp, used: false, type: 'reset' },
      order: { created_at: 'DESC' },
    });

    if (!otpRecord) throw new BadRequestException('OTP không hợp lệ');
    if (otpRecord.expires_at < new Date()) throw new BadRequestException('OTP đã hết hạn');

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // Tạo resetToken tạm để đổi mật khẩu
    const resetToken = uuidv4();
    user.resetToken = resetToken;
    await this.userRepository.save(user);

    return { resetToken };
  }

  async resetPasswordWithDto(body: ResetPasswordDto) {
    const { token, newPassword } = body;
    const user = await this.userRepository.findOne({ where: { resetToken: token } });
    if (!user) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');

    // Kiểm tra mật khẩu mới có trùng mật khẩu cũ không
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    // Hash và lưu mật khẩu mới
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    await this.userRepository.save(user);

    return { message: 'Đặt lại mật khẩu thành công' };
  }
}