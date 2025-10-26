import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  // ✅ Sửa lại tên và kiểu dữ liệu
  async getCommentsByProduct(productId: string) {
    return this.commentRepo.find({
  where: { product: { id: Number(productId) } } as any,
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
  },
  order: { created_at: 'DESC' as any },
});

  }

  // ✅ Khớp với controller + ép kiểu id
  async createComment(userId: string, productId: string, content: string) {
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

    const comment = this.commentRepo.create({ content, user, product });
    return await this.commentRepo.save(comment);
  }
}
