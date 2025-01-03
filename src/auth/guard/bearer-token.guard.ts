import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { TokenPrefix, TokenType } from "../const/auth.const";
import { UsersService } from "src/users/users.service";
import { ErrorCode } from "src/common/const/error.const";

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.', ErrorCode.UNAUTHORIZED);
    }

    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BEARER);
    const payload = this.authService.verifyToken(token);

    const user = await this.usersService.getUserByEmail(payload.email);
    req.token = token;
    req.tokenType = payload.type;
    req.user = user;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (req.tokenType !== TokenType.ACCESS) {
      throw new UnauthorizedException('액세스 토큰이 아닙니다.', ErrorCode.UNAUTHORIZED);
    }
    return true;
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (req.tokenType !== TokenType.REFRESH) {
      throw new UnauthorizedException('리프레시 토큰이 아닙니다.', ErrorCode.UNAUTHORIZED);
    }
    if (req.token !== req.user.refreshToken) {
      throw new UnauthorizedException('리프레시 토큰이 일치하지 않습니다.', ErrorCode.UNAUTHORIZED);
    }
    return true;
  }
}