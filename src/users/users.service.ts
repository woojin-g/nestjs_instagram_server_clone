import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entity/users.entity';
import { Repository } from 'typeorm';
import { ErrorCode } from 'src/common/const/error.const';
import { TokenType } from 'src/auth/const/auth.const';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly usersRepository: Repository<UserModel>,
  ) { }

  async createUser(
    user: Pick<UserModel, 'nickname' | 'email' | 'password'>,
  ): Promise<UserModel> {
    if (!user.nickname || !user.email || !user.password) {
      throw new BadRequestException(ErrorCode.BAD_REQUEST, '잘못된 요청입니다.');
    }

    const emailExists = await this.usersRepository.exists({
      where: { email: user.email },
    });
    if (emailExists) {
      throw new ConflictException(
        ErrorCode.EMAIL_ALREADY_EXISTS,
        '이미 존재하는 이메일입니다.',
      );
    }

    const nicknameExists = await this.usersRepository.exists({
      where: { nickname: user.nickname },
    });
    if (nicknameExists) {
      throw new ConflictException(
        ErrorCode.NICKNAME_ALREADY_EXISTS,
        '이미 존재하는 닉네임입니다.',
      );
    }

    const userModel = this.usersRepository.create({
      nickname: user.nickname,
      email: user.email,
      password: user.password,
    });
    const newUser = await this.usersRepository.save(userModel);
    return newUser;
  }

  async getAllUsers(): Promise<UserModel[]> {
    return this.usersRepository.find();
  }

  async getUserByEmail(email: string): Promise<UserModel> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async saveToken(user: Pick<UserModel, 'id'>, token: string, tokenType: TokenType) {
    await this.usersRepository.update(user.id, {
      [`${tokenType}Token`]: token,
    });
  }
}
