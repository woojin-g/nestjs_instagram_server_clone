import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  TokenPrefix,
  TokenType,
} from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { ErrorCode } from 'src/common/const/error.const';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { ENV_HASH_ROUNDS_KEY, ENV_JWT_SECRET_KEY } from 'src/common/const/env-keys.const';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) { }

  // Pick, Omit, Partial 등을 활용하여 원하는 필드만 선택할 수 있다.
  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(registerUserDto: RegisterUserDto) {
    const hash = await bcrypt.hash(
      registerUserDto.password,
      this.configService.get<number>(ENV_HASH_ROUNDS_KEY),
    );
    const newUser = await this.usersService.createUser({
      nickname: registerUserDto.nickname,
      email: registerUserDto.email,
      password: hash,
    });
    return this.loginUser(newUser);
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UsersModel, 'email' | 'password'>,
  ): Promise<UsersModel> {
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException(
        ErrorCode.UNAUTHORIZED,
        '존재하지 않는 사용자입니다.',
      );
    }
    const isPassed = await bcrypt.compare(user.password, existingUser.password);
    if (!isPassed) {
      throw new UnauthorizedException(
        ErrorCode.WRONG_PASSWORD,
        '비밀번호가 일치하지 않습니다.',
      );
    }
    return existingUser;
  }

  private async loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: await this.signToken(user, TokenType.ACCESS),
      refreshToken: await this.signToken(user, TokenType.REFRESH),
    };
  }

  private async signToken(
    user: Pick<UsersModel, 'email' | 'id'>,
    tokenType: TokenType,
  ): Promise<string> {
    const payload = {
      email: user.email,
      id: user.id,
      type: tokenType,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get(ENV_JWT_SECRET_KEY),
      expiresIn: tokenType === TokenType.REFRESH ? 3600 : 300,
    });
    await this.usersService.saveToken(user, token, tokenType);
    return token;
  }

  extractTokenFromHeader(rawToken: string, tokenPrefix: TokenPrefix): string {
    const splitToken = rawToken.split(' ');
    if (splitToken.length !== 2 || tokenPrefix.valueOf() !== splitToken[0]) {
      throw new UnauthorizedException(
        ErrorCode.UNAUTHORIZED,
        '잘못된 토큰 형식입니다.',
      );
    }
    return splitToken[1];
  }

  decodeBasicToken(token: string): { email: string; password: string } {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const split = decoded.split(':');
    if (split.length != 2) {
      throw new UnauthorizedException(
        ErrorCode.UNAUTHORIZED,
        '잘못된 토큰 형식입니다.',
      );
    }
    return {
      email: split[0],
      password: split[1],
    };
  }

  verifyToken(token: string) {
    let payload;
    try {
      payload = this.jwtService.verify(
        token,
        { secret: this.configService.get(ENV_JWT_SECRET_KEY) },
      );
    }
    catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, '잘못된 토큰입니다.');
      }
    }
    // TODO: 만료 여부 확인
    return payload;
  }

  async rotateToken(refreshToken: string, tokenTypeToRotate: TokenType): Promise<string> {
    const decoded = this.jwtService.decode(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new UnauthorizedException(ErrorCode.UNAUTHORIZED, '잘못된 토큰입니다.');
    }
    return await this.signToken(decoded, tokenTypeToRotate);
  }
}
