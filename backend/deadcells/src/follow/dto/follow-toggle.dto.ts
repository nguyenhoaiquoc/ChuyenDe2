import { IsNotEmpty, IsNumber } from 'class-validator';

export class FollowToggleDto {
  @IsNumber()
  @IsNotEmpty()
  followerId: number; 

  @IsNumber()
  @IsNotEmpty()
  followingId: number;
}