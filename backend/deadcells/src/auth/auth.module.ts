import { forwardRef,Module } from '@nestjs/common';
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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module'; 
import { GroupMember } from 'src/entities/group-member.entity';

@Module({
  imports: [
   forwardRef(() => UsersModule),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Role, Status, OtpVerification,GroupMember]),

    // ✅ import PassportModule
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ✅ JwtModule toàn cục
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'supersecretkey',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    RoleSeedService,
    JwtStrategy,
  ],

  // ✅ export những gì đã import hoặc tự tạo
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
