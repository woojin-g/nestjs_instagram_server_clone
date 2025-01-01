import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { ErrorCode } from "src/common/const/error.const";
import { UserModel } from "../entity/users.entity";

export const User = createParamDecorator((data: keyof UserModel | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user = req.user as UserModel;
  if (!user) {
    throw new InternalServerErrorException(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'User 데코레이터를 사용하려면 AccessTokenGuard를 사용해야 합니다.',
    );
  }

  if (data) {
    return user[data];
  }

  return user;
});