import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number; // ID của người nhận

  @IsNumber()
  @IsNotEmpty()
  actorId: number; // ID của người gây ra hành động

  @IsNumber()
  @IsNotEmpty()
  actionId: number; // ID của hành động (e.g., 1 = 'comment')

  @IsNumber()
  @IsNotEmpty()
  targetTypeId: number; // ID của loại đối tượng (e.g., 1 = 'product')

  @IsNumber()
  @IsNotEmpty()
  targetId: number; // ID của đối tượng (e.g., ID của cái comment)

  @IsNumber()
  @IsOptional()
  productId?: number; // ID của sản phẩm (nếu có)

  @IsNumber()
  @IsOptional()
  groupId?: number;
}