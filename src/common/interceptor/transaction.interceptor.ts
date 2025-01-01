import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { catchError, Observable, tap } from "rxjs";
import { DataSource } from "typeorm";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) { }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너를 생성한다.
    const queryRunner = this.dataSource.createQueryRunner();
    // 쿼리 러너를 데이터베이스에 연결한다.
    await queryRunner.connect();
    // 트랜잭션을 시작한다.
    await queryRunner.startTransaction();

    request.queryRunner = queryRunner;

    return next
      .handle()
      .pipe(
        catchError(async (error) => {
          await queryRunner.rollbackTransaction();
          await queryRunner.release();
          throw error;
        }),
        tap(async () => {
          await queryRunner.commitTransaction();
          await queryRunner.release();
        }),
      );
  }
}
