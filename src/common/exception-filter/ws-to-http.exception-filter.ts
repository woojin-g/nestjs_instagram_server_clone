import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";
import { transformHttpExceptionToErrorResponse } from "./custom-exception";

// BaseWsExceptionFilter를 상속받아 HttpException 타입의 예외를 'exception' 이벤트로 전달하는 필터를 적용한다.
// HttpException 타입의 예외만 catch
@Catch(HttpException)
export class WsToHttpExceptionFilter
  // HttpException 타입의 예외만 처리하는 WsExceptionFilter를 뜻함
  extends BaseWsExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const { status, errorCode, message } = transformHttpExceptionToErrorResponse(exception);
    const socket = host.switchToWs().getClient();
    socket.emit('exception', {
      status,
      errorCode,
      message,
    });
  }
}
