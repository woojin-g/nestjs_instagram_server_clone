import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LogInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const path = req.originalUrl;
    const requestTime = new Date();
    console.log(`[REQ] ${req.method} ${path} (${requestTime.toLocaleString('kr')})`);

    return next
      // 라우트의 로직이 전부 실행된 뒤, Observable 타입의 응답을 반환한다.
      .handle()
      // 반환된 Observable 타입의 응답에 대해 추가적인 처리를 진행한다.
      .pipe(
        tap(() => {
          const res = context.switchToHttp().getResponse();
          const statusCode = res.statusCode;
          const responseTime = new Date();
          const timeDiff = responseTime.getMilliseconds() - requestTime.getMilliseconds();
          console.log(`[RES] ${req.method} ${path} ${statusCode} (${timeDiff}ms, ${responseTime.toLocaleString('kr')})`);
        }),
        // 응답을 변형하고자 할 때 사용
        // map((res) => { }),
      );
  }
}
