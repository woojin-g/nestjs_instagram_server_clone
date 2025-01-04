import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { CustomException, errorMessageMap, httpExceptionErrorCodeMap, transformHttpExceptionToErrorResponse } from "./custom-exception";
import { ErrorCode } from "../const/error.const";

// HttpException 예외를 처리하는 필터
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const { status, errorCode, message } = transformHttpExceptionToErrorResponse(exception);
    response
      .status(status)
      .json({
        status,
        errorCode,
        message,
        path: request.url,
        timestamp: new Date().toLocaleString('kr'),
      });
  }
}
