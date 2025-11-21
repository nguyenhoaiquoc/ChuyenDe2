import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';

import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupRole } from '../entities/group-role.entity';
import { GroupInvitation } from '../entities/group-invitation.entity';
import { Product } from 'src/entities/product.entity';
import { ProductStatus } from 'src/entities/product-status.entity';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { NotificationModule } from 'src/notification/notification.module';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GroupSeedService } from './seed/groups.seed';
import { GroupRoleSeedService } from './seed/group-role.seed';
import { ChatModule } from 'src/chat/chat.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupRole,
      Product,
      ProductStatus,
      GroupInvitation,
      User,
    ]), UsersModule,
    forwardRef(() => FavoritesModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ChatModule),
  ],
  providers: [GroupService, GroupRoleSeedService, GroupSeedService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}