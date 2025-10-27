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
<<<<<<< HEAD

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Status,OtpVerification]),
    JwtModule.register({
      secret: '********', // đổi thành key riêng của bạn
      signOptions: { expiresIn: '1d' },
=======
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Role, Status, OtpVerification]),

    // ✅ JwtModule toàn cục
    JwtModule.registerAsync({
      global: true, // 👈 thêm dòng này!
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'supersecretkey',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
>>>>>>> e6bd1a6094cac90d7c947e4d43ee15ecd1f5932c
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, RoleSeedService],
  exports: [AuthService],
})
export class AuthModule {}
