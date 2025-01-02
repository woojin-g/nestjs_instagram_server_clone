import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

// HttpException 예외를 처리하는 필터
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse();
    const errorCode = errorResponse['error'];
    const message = exception.message;

    // 로그파일 생성, 에러 모니터링 시스템 API 연동 가능

    response
      .status(status)
      .json({
        statusCode: status,
        errorCode,
        message,
        path: request.url,
        timestamp: new Date().toLocaleString('kr'),
      });
  }
}
