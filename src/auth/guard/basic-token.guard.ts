import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { TokenPrefix } from "../const/auth.const";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";

@Injectable()
export class BasicTokenGuard implements CanActivate {
  constructor(private readonly authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawToken = req.headers['authorization'];
    if (!rawToken) {
      throw new CustomException(ErrorCode.UNAUTHORIZED__NO_TOKEN);
    }

    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BASIC);
    const userData = this.authService.decodeBasicToken(token);
    const user = await this.authService.authenticateWithEmailAndPassword(userData);
    req.user = user;
    return true;
  }
}
