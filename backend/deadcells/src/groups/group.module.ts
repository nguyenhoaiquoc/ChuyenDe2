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
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, GroupRole, Product, ProductStatus]),ChatModule],
  
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
