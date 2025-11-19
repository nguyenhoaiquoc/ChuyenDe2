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
import { User } from 'src/entities/user.entity';

import { ChatModule } from 'src/chat/chat.module';
import { NotificationModule } from 'src/notification/notification.module';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      GroupMember,
      GroupRole,
      GroupInvitation,
      Product,
      ProductStatus,
      User, // thêm User
    ]),
    forwardRef(() => ChatModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => FavoritesModule),
    forwardRef(() => ProductModule),
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
