import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Role } from 'src/entities/role.entity';
import { Status } from 'src/entities/status.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { OtpVerification } from 'src/entities/otp-verification.entity';
import { RoleSeedService } from './seed/role.seed.service';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ để đọc biến môi trường

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ load .env (chỉ cần 1 lần ở app chính, nhưng để đây cũng ok)
    TypeOrmModule.forFeature([User, Role, Status, OtpVerification]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'supersecretkey',
        signOptions: { expiresIn: '1d' }, // ⚡ nên để 10–15 phút thay vì 1d
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, RoleSeedService],
  exports: [AuthService],
})
export class AuthModule {}
