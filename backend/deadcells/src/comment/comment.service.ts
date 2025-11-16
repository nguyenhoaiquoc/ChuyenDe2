import { 
  BadRequestException, 
  Injectable, 
  NotFoundException, 
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm'; 
import { Comment } from 'src/entities/comment.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getCommentsByProduct(productId: string) {
    return this.commentRepo.find({
      where: { 
        product: { id: Number(productId) },
        parent_id: IsNull(), // CHỈ LẤY BÌNH LUẬN GỐC (CHA)
      },
      relations: [
        'user',          // Lấy user của bình luận cha
        'children',      // Lấy các bình luận con
        'children.user'  // Lấy user của các bình luận con
      ],
      select: {
        id: true,
        content: true,
        created_at: true,
        user: {
          id: true,
          fullName: true,
          image: true,
        },
        children: { // Chọn dữ liệu cho các bình luận con
          id: true,
          content: true,
          created_at: true,
          user: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
      order: { created_at: 'DESC' }, // Sắp xếp bình luận cha
      // Sắp xếp bình luận con (children) có thể cần xử lý thêm nếu muốn
    });
  }

  async createComment(
    userId: string,
    productId: string,
    content: string,
    parentId?: string, 
  ) {
    const parsedUserId = Number(userId);
    const parsedProductId = Number(productId);

    if (isNaN(parsedUserId) || isNaN(parsedProductId)) {
      throw new BadRequestException('userId hoặc productId không hợp lệ');
    }

    const user = await this.userRepo.findOne({ where: { id: parsedUserId } });
    const product = await this.productRepo.findOne({
      where: { id: parsedProductId },
    });

    if (!user || !product) {
      throw new NotFoundException('User hoặc Product không tồn tại');
    }

    // 🚀 Xử lý bình luận cha (nếu có)
    let parent: Comment | null = null;
    if (parentId) {
      const parsedParentId = Number(parentId);
      if (isNaN(parsedParentId)) {
        throw new BadRequestException('parent_id không hợp lệ');
      }
      parent = await this.commentRepo.findOne({ where: { id: parsedParentId } });
      if (!parent) {
        throw new NotFoundException('Bình luận cha không tồn tại');
      }
    }

    const comment = this.commentRepo.create({
      content,
      user,
      product,
      parent_id: parent ? parent.id : null,
    });
    
    const savedComment = await this.commentRepo.save(comment);

    return this.commentRepo.findOne({
      where: { id: savedComment.id },
      relations: ['user'], 
      select: {
        id: true,
        content: true,
        created_at: true,
        user: {
          id: true,
          fullName: true,
          image: true,
        },
      }
    });
  }

  // Xóa bình luận
  async deleteComment(commentId: string, userId: string) {
    const parsedCommentId = Number(commentId);
    const parsedUserId = Number(userId);

    if (isNaN(parsedCommentId) || isNaN(parsedUserId)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const comment = await this.commentRepo.findOne({
      where: { id: parsedCommentId },
      relations: ['user'], // Load 'user' để kiểm tra quyền
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    // Chỉ chủ bình luận mới được xóa
  if (Number(comment.user.id) !== parsedUserId) {
  throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
}

    await this.commentRepo.remove(comment);
    return { message: 'Đã xóa bình luận', deleted: true, id: parsedCommentId };
  }

  // CẬP NHẬT BÌNH LUẬN
  async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ) {
    const parsedCommentId = Number(commentId);
    const parsedUserId = Number(userId);

    if (isNaN(parsedCommentId) || isNaN(parsedUserId)) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const comment = await this.commentRepo.findOne({
      where: { id: parsedCommentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    // Chỉ chủ bình luận mới được sửa
    if (Number(comment.user.id) !== parsedUserId) {
      throw new ForbiddenException('Bạn không có quyền sửa bình luận này');
    }

    // Cập nhật nội dung
    comment.content = content;
    
    // Lưu và trả về
    return await this.commentRepo.save(comment);
  }
}