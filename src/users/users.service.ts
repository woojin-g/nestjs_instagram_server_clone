import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entity/users.entity';
import { Repository } from 'typeorm';
import { ErrorCode } from 'src/common/const/error.const';
import { TokenType } from 'src/auth/const/auth.const';
import { CustomException } from 'src/common/exception-filter/custom-exception';

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
