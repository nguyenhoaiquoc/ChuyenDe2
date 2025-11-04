import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { Product } from "src/entities/product.entity";
import { User } from "src/entities/user.entity";
import { Comment } from "src/entities/comment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Product, User])],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
