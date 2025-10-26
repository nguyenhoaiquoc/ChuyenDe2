import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
    @Body() body: { content: string; user_id: string; product_id: string },
  ) {
    const { content, user_id, product_id } = body;
    return this.commentService.createComment(user_id, product_id, content);
  }
}
