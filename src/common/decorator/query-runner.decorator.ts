import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { ErrorCode } from "../const/error.const";
import { CustomException } from "../exception-filter/custom-exception";

export const QueryRunner = createParamDecorator((data: any, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  if (!req.queryRunner) {
    throw new CustomException(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'QueryRunner 데코레이터를 사용하려면 TransactionInterceptor를 사용해야 합니다.',
    );
  }
  return req.queryRunner;
});
