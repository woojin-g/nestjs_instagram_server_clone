import { BadRequestException, ConflictException, HttpException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";

import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../const/error.const";

export function transformHttpExceptionToErrorResponse(exception: HttpException) {
  const status = exception.getStatus();
  if (exception instanceof CustomException) {
    const response = exception.getResponse() as { error: ErrorCode; message: string };
    return {
      status,
      errorCode: response.error,
      message: response.message,
    };
  }

  const exceptionResponse = exception.getResponse();
  const errorCode = httpExceptionErrorCodeMap[exception.constructor.name];
  const message = (exceptionResponse['message'] instanceof Array
    ? exceptionResponse['message'][0]
    : exceptionResponse['message'])
    ?? errorMessageMap[errorCode];

  return {
    status,
    errorCode,
    message,
  };
}

export class CustomException extends HttpException {
  constructor(errorCode: ErrorCode, message?: string) {
    super({
      error: errorCode,
      message: message ?? errorMessageMap[errorCode],
    }, errorCodeStatusMap[errorCode]);
  }

  toErrorResponse() {
    return transformHttpExceptionToErrorResponse(this);
  }
}

export const httpExceptionErrorCodeMap = {
  [InternalServerErrorException.name]: ErrorCode.INTERNAL_SERVER_ERROR,
  [UnauthorizedException.name]: ErrorCode.UNAUTHORIZED,
  [BadRequestException.name]: ErrorCode.BAD_REQUEST,
  [NotFoundException.name]: ErrorCode.NOT_FOUND,
  [ConflictException.name]: ErrorCode.CONFLICT,
}

export const errorMessageMap = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: '서버 오류',

  [ErrorCode.UNAUTHORIZED]: '인증되지 않은 사용자입니다.',
  [ErrorCode.UNAUTHORIZED__NO_USER]: '존재하지 않는 사용자입니다.',
  [ErrorCode.UNAUTHORIZED__NO_TOKEN]: '토큰이 없습니다.',
  [ErrorCode.UNAUTHORIZED__WRONG_PASSWORD]: '비밀번호가 틀렸습니다.',
  [ErrorCode.UNAUTHORIZED__INVALID_TOKEN]: '잘못된 토큰입니다.',

  [ErrorCode.CONFLICT]: '중복된 데이터가 존재합니다.',
  [ErrorCode.CONFLICT__NICKNAME_ALREADY_EXISTS]: '이미 존재하는 닉네임입니다.',
  [ErrorCode.CONFLICT__EMAIL_ALREADY_EXISTS]: '이미 존재하는 이메일입니다.',

  [ErrorCode.FORBIDDEN]: '권한이 없습니다.',
  [ErrorCode.FORBIDDEN__NOT_AUTHOR]: '작성자가 아닙니다.',

  [ErrorCode.NOT_FOUND]: '존재하지 않는 데이터입니다.',
  [ErrorCode.NOT_FOUND__USER]: '존재하지 않는 사용자입니다.',
  [ErrorCode.NOT_FOUND__POST]: '존재하지 않는 게시글입니다.',
  [ErrorCode.NOT_FOUND__COMMENT]: '존재하지 않는 댓글입니다.',
  [ErrorCode.NOT_FOUND__IMAGE]: '존재하지 않는 이미지입니다.',
  [ErrorCode.NOT_FOUND__CHAT_ROOM]: '존재하지 않는 채팅방입니다.',

  [ErrorCode.BAD_REQUEST]: '잘못된 요청입니다.',
  [ErrorCode.BAD_REQUEST__STRING_TOO_LONG]: '너무 긴 문자열입니다.',
  [ErrorCode.BAD_REQUEST__STRING_TOO_SHORT]: '너무 짧은 문자열입니다.',
};

const errorCodeStatusMap = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,

  [ErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.UNAUTHORIZED__NO_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.UNAUTHORIZED__WRONG_PASSWORD]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.UNAUTHORIZED__INVALID_TOKEN]: HttpStatus.UNAUTHORIZED,
  [ErrorCode.UNAUTHORIZED__NO_USER]: HttpStatus.UNAUTHORIZED,

  [ErrorCode.CONFLICT]: HttpStatus.CONFLICT,
  [ErrorCode.CONFLICT__NICKNAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ErrorCode.CONFLICT__EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,

  [ErrorCode.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [ErrorCode.FORBIDDEN__NOT_AUTHOR]: HttpStatus.FORBIDDEN,

  [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ErrorCode.NOT_FOUND__USER]: HttpStatus.NOT_FOUND,
  [ErrorCode.NOT_FOUND__POST]: HttpStatus.NOT_FOUND,
  [ErrorCode.NOT_FOUND__COMMENT]: HttpStatus.NOT_FOUND,
  [ErrorCode.NOT_FOUND__IMAGE]: HttpStatus.NOT_FOUND,
  [ErrorCode.NOT_FOUND__CHAT_ROOM]: HttpStatus.NOT_FOUND,

  [ErrorCode.BAD_REQUEST]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BAD_REQUEST__STRING_TOO_LONG]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BAD_REQUEST__STRING_TOO_SHORT]: HttpStatus.BAD_REQUEST,
  [ErrorCode.BAD_REQUEST__INVALID_FILTER]: HttpStatus.BAD_REQUEST,
}