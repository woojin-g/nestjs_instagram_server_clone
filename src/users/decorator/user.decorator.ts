import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ErrorCode } from "src/common/const/error.const";
import { UserModel } from "../entity/users.entity";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { AccessTokenRestApiGuard } from "src/auth/guard/bearer-token.rest-api.guard";

export const User = createParamDecorator((data: keyof UserModel | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user = req.user as UserModel;
  if (!user) {
    throw new CustomException(
      ErrorCode.INTERNAL_SERVER_ERROR,
      `${User.name} 데코레이터를 사용하려면 ${AccessTokenRestApiGuard.name}를 사용해야 합니다.`,
    );
  }

  if (data) {
    return user[data];
  }

  return user;
});