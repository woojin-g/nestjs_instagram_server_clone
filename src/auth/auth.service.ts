import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { UsersModel } from 'src/users/entities/users.entity';
import {
  HASH_ROUNDS,
  JWT_SECRET,
  TokenPrefix,
  TokenType,
} from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async loginWithEmail(user: Pick<UsersModel, 'email' | 'password'>) {
    const existingUser = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(existingUser);
  }

  async registerWithEmail(
    user: Pick<UsersModel, 'nickname' | 'email' | 'password'>,
  ) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS);
    const newUser = await this.usersService.createUser({
      nickname: user.nickname,
      email: user.email,
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
        'UNAUTHORIZED',
        '존재하지 않는 사용자입니다.',
      );
    }
    const isPassed = await bcrypt.compare(user.password, existingUser.password);
    if (!isPassed) {
      throw new UnauthorizedException(
        'WRONG_PASSWORD',
        '비밀번호가 일치하지 않습니다.',
      );
    }
    return existingUser;
  }

  private loginUser(user: Pick<UsersModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, TokenType.ACCESS),
      refreshToken: this.signToken(user, TokenType.REFRESH),
    };
  }

  private signToken(
    user: Pick<UsersModel, 'email' | 'id'>,
    tokenType: TokenType,
  ): string {
    const payload = {
      email: user.email,
      id: user.id,
      type: tokenType,
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: tokenType === TokenType.REFRESH ? 3600 : 300,
    });
  }

  extractTokenFromHeader(rawToken: string, tokenPrefix: TokenPrefix): string {
    const splitToken = rawToken.split(' ');
    if (splitToken.length !== 2 || tokenPrefix.valueOf() !== splitToken[0]) {
      throw new UnauthorizedException(
        'UNAUTHORIZED',
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
        'UNAUTHORIZED',
        '잘못된 토큰 형식입니다.',
      );
    }
    return {
      email: split[0],
      password: split[1],
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, { secret: JWT_SECRET });
    }
    catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new UnauthorizedException('UNAUTHORIZED', '잘못된 토큰입니다.');
      }
    }
  }

  rotateToken(refreshToken: string, tokenTypeToRotate: TokenType) {
    const decoded = this.jwtService.decode(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      throw new UnauthorizedException('UNAUTHORIZED', '잘못된 토큰입니다.');
    }
    return this.signToken(decoded, tokenTypeToRotate);
  }
}
