import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UserSeedService } from './seed/user.seed';
import { Rating } from 'src/entities/rating.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Rating]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserSeedService],
  exports: [UsersService], // nếu muốn dùng service ngoài module này
})
export class UsersModule {}
