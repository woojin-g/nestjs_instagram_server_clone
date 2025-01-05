import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { ErrorCode } from "src/common/const/error.const";
import { TokenPrefix } from "../const/auth.const";

@Injectable()
export class BearerTokenSocketGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket = context.switchToWs().getClient();

    const headers = socket.handshake.headers;
    const rawToken = headers['authorization'];
    if (!rawToken) {
      throw new CustomException(ErrorCode.UNAUTHORIZED__NO_TOKEN);
    }

    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BEARER);
    const payload = this.authService.verifyToken(token);
    const user = await this.usersService.getUserByEmail(payload.email);
    socket.user = user;
    socket.token = token;
    socket.tokenType = payload.type;

    return true;
  }
}
