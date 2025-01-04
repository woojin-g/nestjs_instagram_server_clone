import { ArgumentsHost, Catch, ExceptionFilter, HttpException, InternalServerErrorException } from "@nestjs/common";
import { ErrorCode, errorMessageMap } from "../const/error.const";

// HttpException 예외를 처리하는 필터
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    let status = exception.getStatus();
    const errorResponse = exception['response'];

    // NestJS 내부적으로, 예외 클래스의 첫 파라미터가 message이고, 두 번째 파라미터가 error이다.
    let error = errorResponse['message'];
    let message = errorResponse['error'];

    if (!Object.values(ErrorCode).includes(error)) {
      status = 500;
      error = ErrorCode.INTERNAL_SERVER_ERROR;
      message = '예외 throw 시 ErrorCode가 누락되었거나 존재하지 않는 ErrorCode입니다.';
    }

    // NestJS 기본 메시지가 포함되어 있는 경우, 따로 정의한 메시지로 대체한다.
    if (nestjsDefaultMessage.has(message)) {
      message = errorMessageMap[error];
    }

    // 로그파일 생성, 에러 모니터링 시스템 API 연동 가능

    response
      .status(status)
      .json({
        statusCode: status,
        error,
        message,
        path: request.url,
        timestamp: new Date().toLocaleString('kr'),
      });
  }
}

const nestjsDefaultMessage = new Set([
  'Bad Request',
  'Unauthorized',
  'Payment Required',
  'Forbidden',
  'Not Found',
  'Method Not Allowed',
  'Not Acceptable',
  'Proxy Authentication Required',
  'Request Timeout',
  'Conflict',
  'Gone',
  'Precondition Failed',
  'Payload Too Large',
  'Unsupported Media Type',
  'Unprocessable Entity',
  'Internal Server Error',
  'Not Implemented',
  'Bad Gateway',
  'Service Unavailable',
  'Gateway Timeout',
  'HTTP Version Not Supported',
]);