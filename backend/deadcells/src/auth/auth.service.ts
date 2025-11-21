import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { GroupMember } from 'src/entities/group-member.entity';

@Injectable()
export class AuthService {
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,

  @InjectRepository(GroupMember)
  private readonly groupMemberRepo: Repository<GroupMember>,

  @InjectRepository(OtpVerification)
  private readonly otpRepository: Repository<OtpVerification>,

  private readonly jwtService: JwtService,
  private readonly mailService: MailService,
) {}


  async getUsers() {
    return this.userRepository.find();
  }

  /** ---------------- Register ---------------- */
  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing && existing.is_verified) {
      throw new BadRequestException('Email đã tồn tại');
    }

    let user: User;
    const passwordHash = await bcrypt.hash(dto.password, 10);

    if (existing && !existing.is_verified) {
      // ✅ KHÔNG xoá hard; chỉ cập nhật lại thông tin & regenerate OTP
      existing.nickname = dto.nickname;
      existing.phone = dto.phone ?? existing.phone;
      existing.passwordHash = passwordHash;
      user = await this.userRepository.save(existing);
    } else {
      user = this.userRepository.create({
        email: dto.email,
        passwordHash,
        nickname: dto.nickname,
        phone: dto.phone,
        roleId: 2, // mặc định member
        statusId: existing?.statusId ?? 1, // tuỳ hệ thống: 1 = active
      });

      user = await this.userRepository.save(user);
    }
      await this.groupMemberRepo.save({
        user_id: user.id,
        group_id: dto.group_id,
          group_role_id: 1,
          pending: 3
    })


    // 🔐 Tạo OTP xác minh: 6 chữ số, lưu HASH
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const otpHash = await bcrypt.hash(rawOtp, 10);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 phút

    const otpEntity = this.otpRepository.create({
      user,
      otp_hash: otpHash,
      type: 'verify',
      used: false,
      expires_at: expiresAt,
    });
    await this.otpRepository.save(otpEntity);

    // Gửi mail (gửi mã thô)
    await this.mailService.sendOTP(user.email, rawOtp);

    return { message: 'Đăng ký thành công. OTP đã được gửi về email' };

   
  }

  /** ---------------- Verify Email OTP ---------------- */
  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    // Để tránh enumeration, có thể trả thông điệp chung chung.
    if (!user) throw new BadRequestException('OTP không hợp lệ');

    const otpRecord = await this.otpRepository.findOne({
      where: { user: { id: user.id }, type: 'verify', used: false },
      order: { created_at: 'DESC' },
    });
    if (!otpRecord) throw new BadRequestException('OTP không hợp lệ');
    if (otpRecord.expires_at < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    const ok = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!ok) throw new BadRequestException('OTP không hợp lệ');

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // ✅ Cập nhật trạng thái xác thực tài khoản
    user.is_verified = true;
    user.verifiedAt = new Date();
    await this.userRepository.save(user);

    return { message: 'Xác thực thành công' };
  }

  /** ---------------- Login ---------------- */
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['role', 'status'],
    });

    // Tránh lộ thông tin
    if (!user)
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    if (!user.is_verified) {
      throw new UnauthorizedException(
        'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực OTP.',
      );
    }

    // (Tuỳ chọn) kiểm tra trạng thái bị khoá/banned theo statusId hoặc status.name

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload); // expiresIn cấu hình tại JwtModule

    return {
      token,
      role: user.role?.name,
      fullName: user.fullName,
      id: user.id,
      tokenType: 'Bearer',
    };
  }

  /** ---------------- Forgot Password (send OTP) ---------------- */
  async forgotPassword(email: string) {
    // Tránh enumeration: luôn trả về message trung tính
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
      const otpHash = await bcrypt.hash(rawOtp, 10);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 phút

      const otpEntity = this.otpRepository.create({
        user,
        otp_hash: otpHash,
        type: 'reset',
        used: false,
        expires_at: expiresAt,
      });
      await this.otpRepository.save(otpEntity);

      await this.mailService.sendOTP(user.email, rawOtp);
    }

    return {
      message:
        'Nếu email tồn tại, chúng tôi đã gửi OTP đặt lại mật khẩu tới hộp thư của bạn.',
    };
  }

  /** ---------------- Verify Reset OTP -> cấp reset token tạm ---------------- */
  async verifyResetOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new BadRequestException('OTP không hợp lệ');

    const otpRecord = await this.otpRepository.findOne({
      where: { user: { id: user.id }, type: 'reset', used: false },
      order: { created_at: 'DESC' },
    });
    if (!otpRecord) throw new BadRequestException('OTP không hợp lệ');
    if (otpRecord.expires_at < new Date()) {
      throw new BadRequestException('OTP đã hết hạn');
    }

    const ok = await bcrypt.compare(otp, otpRecord.otp_hash);
    if (!ok) throw new BadRequestException('OTP không hợp lệ');

    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // 🔐 Cấp reset token tạm: LƯU HASH + có hạn
    const rawResetToken = uuidv4();
    user.resetTokenHash = await bcrypt.hash(rawResetToken, 10);
    user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 phút
    await this.userRepository.save(user);

    return { resetToken: rawResetToken };
  }

  /** ---------------- Reset Password bằng token tạm ---------------- */
  async resetPasswordWithDto(body: ResetPasswordDto) {
    const { email, token, newPassword } = body as any; // cần dto có email

    const user = await this.userRepository.findOne({ where: { email } });
    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiresAt ||
      user.resetTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const tokenOk = await bcrypt.compare(token, user.resetTokenHash);
    if (!tokenOk) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    // Không cho trùng mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
      );
    }

    // Hash & lưu mật khẩu mới + xoá reset token + đánh dấu thời điểm đổi mật khẩu
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date();
    user.resetTokenHash = null;
    user.resetTokenExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Đặt lại mật khẩu thành công' };
  }
}
