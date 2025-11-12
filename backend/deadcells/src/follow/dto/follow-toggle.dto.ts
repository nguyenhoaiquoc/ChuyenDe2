// src/follow/dto/follow-toggle.dto.ts
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FollowToggleDto {
  @IsNumber()
  @IsNotEmpty()
  followerId: number; // 👈 Khai báo

  @IsNumber()
  @IsNotEmpty()
  followingId: number; // 👈 Khai báo
}