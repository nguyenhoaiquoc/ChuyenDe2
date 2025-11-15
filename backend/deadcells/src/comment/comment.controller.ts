import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CommentService } from './comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':id')
  async getCommentsByProduct(@Param('id') id: string) {
    return this.commentService.getCommentsByProduct(id);
  }

  @Post()
  async createComment(
    @Body() body: { 
      content: string; 
      user_id: string; 
      product_id: string; 
      parent_id?: string // 👈 Thêm
    },
  ) {
    const { content, user_id, product_id, parent_id } = body;
    return this.commentService.createComment(user_id, product_id, content, parent_id);
  }

  //  Xóa bình luận
  @Delete(':id')
  async deleteComment(
    @Param('id') id: string,
    @Body() body: { user_id: string }, 
  ) {
    return this.commentService.deleteComment(id, body.user_id);
  }

  // Cập nhật bình luận
  @Patch(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() body: { user_id: string; content: string },
  ) {
    const { user_id, content } = body;
    return this.commentService.updateComment(id, user_id, content);
  }
}