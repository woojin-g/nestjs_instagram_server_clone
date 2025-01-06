import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Delete, Get, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './decorator/user.decorator';
import { UserModel } from './entity/users.entity';
import { FollowRelationModel } from './entity/follow-relation.entity';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  getUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('me/followers')
  getMyFollowers(
    @User('id') userId: number,
    @Query('includeUnconfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeUnconfirmed: boolean,
  ): Promise<UserModel[]> {
    return this.usersService.getFollowers(userId, includeUnconfirmed);
  }

  @Get('me/following')
  getMyFollowing(
    @User('id') userId: number,
    @Query('includeUnconfirmed', new DefaultValuePipe(false), ParseBoolPipe) includeUnconfirmed: boolean,
  ): Promise<UserModel[]> {
    return this.usersService.getFollowing(userId, includeUnconfirmed);
  }

  @Get(':id/followers')
  getFollowers(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserModel[]> {
    return this.usersService.getFollowers(userId);
  }

  @Get(':id/following')
  getFollowing(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<UserModel[]> {
    return this.usersService.getFollowing(userId);
  }

  @Post('me/following/:id')
  postMyFollowing(
    @User('id') followerId: number,
    @Param('id', ParseIntPipe) followeeId: number,
  ): Promise<FollowRelationModel> {
    return this.usersService.follow(followerId, followeeId);
  }

  // 나를 팔로우하는 것을 수락
  @Patch('me/followers/:id')
  @UseInterceptors(TransactionInterceptor)
  patchMyFollower(
    @User('id') followeeId: number,
    @Param('id', ParseIntPipe) followerId: number,
    @QueryRunner() qr: QR,
  ): Promise<FollowRelationModel> {
    return this.usersService.confirmFollow(followerId, followeeId, qr);
  }

  // 팔로우 취소
  @Delete('me/followers/:id')
  @UseInterceptors(TransactionInterceptor)
  deleteMyFollower(
    @User('id') followerId: number,
    @Param('id', ParseIntPipe) followeeId: number,
    @QueryRunner() qr: QR,
  ): Promise<boolean> {
    return this.usersService.unfollow(followerId, followeeId, qr);
  }
}

