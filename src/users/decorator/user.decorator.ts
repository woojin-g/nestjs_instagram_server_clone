import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { ErrorCode } from "src/common/const/error.const";
import { UsersModel } from "../entities/users.entity";

export const User = createParamDecorator((data: keyof UsersModel | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  const user = req.user as UsersModel;
  if (!user) {
    throw new InternalServerErrorException(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Request에 user 프로퍼티가 없습니다.',
    );
  }

  if (data) {
    return user[data];
  }

  return user;
});