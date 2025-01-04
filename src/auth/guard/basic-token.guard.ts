import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { TokenPrefix } from "../const/auth.const";
import { ErrorCode } from "src/common/const/error.const";

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new UnauthorizedException(
        ErrorCode.UNAUTHORIZED__NO_TOKEN,
        '토큰이 없습니다.',
      );
    }

    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BASIC);
    const userData = this.authService.decodeBasicToken(token);
    const user = await this.authService.authenticateWithEmailAndPassword(userData);
    req.user = user;
    return true;
  }
}
