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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Status,OtpVerification]),
    JwtModule.register({
      secret: '********', // đổi thành key riêng của bạn
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService,MailService],
  controllers: [AuthController],
})
export class AuthModule {}
