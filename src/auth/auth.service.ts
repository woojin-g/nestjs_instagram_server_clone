import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/users/entity/users.entity';
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
  async loginWithEmail(user: Pick<UserModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(registerUserDto: RegisterUserDto) {
    const hashRounds = parseInt(this.configService.get(ENV_HASH_ROUNDS_KEY));
    const hash = await bcrypt.hash(
      registerUserDto.password,
      hashRounds,
    );
    const newUser = await this.usersService.createUser({
      nickname: registerUserDto.nickname,
      email: registerUserDto.email,
      password: hash,
    });
    return this.loginUser(newUser);
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UserModel, 'email' | 'password'>,
  ): Promise<UserModel> {
    const existingUser = await this.usersService.getUserByEmail(user.email);
    if (!existingUser) {
      throw new UnauthorizedException(
        '존재하지 않는 사용자입니다.',
        ErrorCode.UNAUTHORIZED,
      );
    }
    const isPassed = await bcrypt.compare(user.password, existingUser.password);
    if (!isPassed) {
      throw new UnauthorizedException(
        '비밀번호가 일치하지 않습니다.',
        ErrorCode.WRONG_PASSWORD,
      );
    }
    return existingUser;
  }

  private async loginUser(user: Pick<UserModel, 'email' | 'id'>) {
    return {
      accessToken: await this.signToken(user, TokenType.ACCESS),
      refreshToken: await this.signToken(user, TokenType.REFRESH),
    };
  }

  private async signToken(
    user: Pick<UserModel, 'email' | 'id'>,
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
        '잘못된 토큰 형식입니다.',
        ErrorCode.UNAUTHORIZED,
      );
    }
    return splitToken[1];
  }

  decodeBasicToken(token: string): { email: string; password: string } {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const split = decoded.split(':');
    if (split.length != 2) {
      throw new UnauthorizedException(
        '잘못된 토큰 형식입니다.',
        ErrorCode.UNAUTHORIZED,
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
        throw new UnauthorizedException('잘못된 토큰입니다.', ErrorCode.UNAUTHORIZED);
      }
    }
    // TODO: 만료 여부 확인
    return payload;
  }

  async rotateToken(refreshToken: string, tokenTypeToRotate: TokenType): Promise<string> {
    const decoded = this.jwtService.decode(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new UnauthorizedException('잘못된 토큰입니다.', ErrorCode.UNAUTHORIZED);
    }
    return await this.signToken(decoded, tokenTypeToRotate);
  }
}
