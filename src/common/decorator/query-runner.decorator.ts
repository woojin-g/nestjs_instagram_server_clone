import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";
import { ErrorCode } from "../const/error.const";

export const QueryRunner = createParamDecorator((data: any, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  if (!req.queryRunner) {
    throw new InternalServerErrorException(
      'QueryRunner 데코레이터를 사용하려면 TransactionInterceptor를 사용해야 합니다.',
      ErrorCode.INTERNAL_SERVER_ERROR,
    );
  }
  return req.queryRunner;
});
