import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";
import { TokenPrefix, TokenType } from "../const/auth.const";
import { UsersService } from "src/users/users.service";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { IS_PUBLIC_KEY } from "src/common/decorator/is-public.decorator";

@Injectable()
class BearerTokenRestApiGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new CustomException(ErrorCode.UNAUTHORIZED__NO_TOKEN);
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
export class AccessTokenRestApiGuard extends BearerTokenRestApiGuard {
  constructor(
    authService: AuthService,
    usersService: UsersService,
    private readonly reflector: Reflector,
  ) {
    super(authService, usersService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // @IsPublic() 데코레이터가 적용된 API는 토큰 검증을 건너뛴다.
    if (isPublic) {
      return true;
    }

    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();
    if (req.tokenType !== TokenType.ACCESS) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED__INVALID_TOKEN,
        '액세스 토큰이 아닙니다.',
      );
    }
    return true;
  }
}

@Injectable()
export class RefreshTokenRestApiGuard extends BearerTokenRestApiGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const req = context.switchToHttp().getRequest();

    if (req.tokenType !== TokenType.REFRESH) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED__INVALID_TOKEN,
        '리프레시 토큰이 아닙니다.',
      );
    }
    if (req.token !== req.user.refreshToken) {
      throw new CustomException(
        ErrorCode.UNAUTHORIZED__INVALID_TOKEN,
        '리프레시 토큰이 일치하지 않습니다.',
      );
    }
    return true;
  }
}