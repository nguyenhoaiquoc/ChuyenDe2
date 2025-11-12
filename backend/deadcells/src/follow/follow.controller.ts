// src/follow/follow.controller.ts
import { Controller, Post, Get, Body, Query, ParseIntPipe, Param , HttpCode, HttpStatus } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowToggleDto } from './dto/follow-toggle.dto';


@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // API: POST /follow/toggle
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  toggleFollow(@Body() dto: FollowToggleDto) {
    return this.followService.toggleFollow(dto.followerId, dto.followingId);
  }

  // API: GET /follow/status?followerId=1&followingId=2
  @Get('status')
  checkStatus(
    @Query('followerId', ParseIntPipe) followerId: number,
    @Query('followingId', ParseIntPipe) followingId: number,
  ) {
    return this.followService.checkFollowStatus(followerId, followingId);
  }

  @Get(':userId/follower-count')
  async getFollowerCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowerCount(userId);
  }

  @Get(':userId/following-count')
  async getFollowingCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowingCount(userId);
  }
  
  @Get(':userId/followers')
  async getFollowers(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowers(userId);
  }

  @Get(':userId/following')
  async getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    return this.followService.getFollowing(userId);
  }
}