import { ProductModule } from 'src/product/product.module';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { GroupMember } from '../entities/group-member.entity';
import { GroupRole } from '../entities/group-role.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { Product } from 'src/entities/product.entity';
import { ProductStatus } from 'src/entities/product-status.entity';
<<<<<<< HEAD
import { FavoritesModule } from 'src/favorites/favorites.module';
import { GroupInvitation } from 'src/entities/group-invitation.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GroupSeedService } from './seed/groups.seed';
import { GroupRoleSeedService } from './seed/group-role.seed';

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
    ]),
    forwardRef(() => FavoritesModule),
    forwardRef(() => NotificationModule),
    forwardRef(() => AuthModule),
  ],
  providers: [GroupService, GroupRoleSeedService, GroupSeedService],
=======
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, GroupRole, Product, ProductStatus]),ChatModule],
  
  providers: [GroupService],
>>>>>>> 71fbeb87f962df5a107cb9851723f04851893807
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
