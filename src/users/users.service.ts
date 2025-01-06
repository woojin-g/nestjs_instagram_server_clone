import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entity/users.entity';
import { QueryRunner, Repository } from 'typeorm';
import { ErrorCode } from 'src/common/const/error.const';
import { TokenType } from 'src/auth/const/auth.const';
import { CustomException } from 'src/common/exception-filter/custom-exception';
import { FollowRelationModel } from './entity/follow-relation.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly usersRepository: Repository<UserModel>,
    @InjectRepository(FollowRelationModel)
    private readonly followRelationsRepository: Repository<FollowRelationModel>,
  ) { }

  getUsersRepository(qr?: QueryRunner): Repository<UserModel> {
    return qr ? qr.manager.getRepository(UserModel) : this.usersRepository;
  }

  getFollowRelationsRepository(qr?: QueryRunner): Repository<FollowRelationModel> {
    return qr ? qr.manager.getRepository(FollowRelationModel) : this.followRelationsRepository;
  }

  async createUser(
    user: Pick<UserModel, 'nickname' | 'email' | 'password'>,
  ): Promise<UserModel> {
    if (!user.nickname || !user.email || !user.password) {
      throw new CustomException(ErrorCode.BAD_REQUEST);
    }

    const emailExists = await this.usersRepository.exists({
      where: { email: user.email },
    });
    if (emailExists) {
      throw new CustomException(ErrorCode.CONFLICT__EMAIL_ALREADY_EXISTS);
    }

    const nicknameExists = await this.usersRepository.exists({
      where: { nickname: user.nickname },
    });
    if (nicknameExists) {
      throw new CustomException(ErrorCode.CONFLICT__NICKNAME_ALREADY_EXISTS);
    }

    const userModel = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });
    const newUser = await this.usersRepository.save(userModel);
    return newUser;
  }

  getAllUsers(): Promise<UserModel[]> {
    return this.usersRepository.find();
  }

  getUserByEmail(email: string): Promise<UserModel> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * 팔로우 생성
   * @param followerId 팔로우 실행 유저
   * @param followeeId 팔로우 대상 유저
   */
  follow(followerId: number, followeeId: number): Promise<FollowRelationModel> {
    return this.followRelationsRepository.save({
      follower: { id: followerId },
      followee: { id: followeeId },
    });
  }

  async getFollowers(userId: number, includeUnconfirmed: boolean = false): Promise<UserModel[]> {
    const where = { followee: { id: userId } };
    if (!includeUnconfirmed) {
      where['isConfirmed'] = true;
    }
    const followRelations = await this.followRelationsRepository.find({
      where,
      relations: { follower: true, followee: true },
    });
    return followRelations.map((relation) => relation.follower);
  }

  async getFollowing(userId: number, includeUnconfirmed: boolean = false): Promise<UserModel[]> {
    const where = { follower: { id: userId } };
    if (!includeUnconfirmed) {
      where['isConfirmed'] = true;
    }
    const followRelations = await this.followRelationsRepository.find({
      where,
      relations: { follower: true, followee: true },
    });
    return followRelations.map((relation) => relation.followee);
  }

  async confirmFollow(followerId: number, followeeId: number, qr?: QueryRunner): Promise<FollowRelationModel> {
    const repository = this.getFollowRelationsRepository(qr);
    const followRelation = await repository.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
      relations: { follower: true, followee: true },
    });
    if (!followRelation) {
      throw new CustomException(ErrorCode.NOT_FOUND__FOLLOW_RELATION);
    }
    await this.incrementFollowerCount(followeeId, qr);
    await this.incrementFollowingCount(followerId, qr);
    return repository.save({ ...followRelation, isConfirmed: true });
  }

  async unfollow(followerId: number, followeeId: number, qr?: QueryRunner): Promise<boolean> {
    const repository = this.getFollowRelationsRepository(qr);
    const followRelation = await repository.findOne({
      where: { follower: { id: followerId }, followee: { id: followeeId } },
      relations: { follower: true, followee: true },
    });
    if (!followRelation) {
      throw new CustomException(ErrorCode.NOT_FOUND__FOLLOW_RELATION);
    }

    if (followRelation.isConfirmed) {
      await this.decrementFollowerCount(followeeId, qr);
      await this.decrementFollowingCount(followerId, qr);
    }
    await repository.delete(followRelation.id);
    return true;
  }

  async incrementFollowerCount(userId: number, qr?: QueryRunner): Promise<void> {
    const repository = this.getUsersRepository(qr);
    await repository.increment({ id: userId }, 'followerCount', 1);
  }

  async incrementFollowingCount(userId: number, qr?: QueryRunner): Promise<void> {
    const repository = this.getUsersRepository(qr);
    await repository.increment({ id: userId }, 'followingCount', 1);
  }

  async decrementFollowerCount(userId: number, qr?: QueryRunner): Promise<void> {
    const repository = this.getUsersRepository(qr);
    await repository.decrement({ id: userId }, 'followerCount', 1);
  }

  async decrementFollowingCount(userId: number, qr?: QueryRunner): Promise<void> {
    const repository = this.getUsersRepository(qr);
    await repository.decrement({ id: userId }, 'followingCount', 1);
  }

  async saveToken(user: Pick<UserModel, 'id'>, token: string, tokenType: TokenType) {
    await this.usersRepository.update(user.id, {
      [`${tokenType}Token`]: token,
    });
  }
}
