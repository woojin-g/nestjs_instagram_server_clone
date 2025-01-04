import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";
import { ErrorCode } from "src/common/const/error.const";

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(private readonly maxLength: number) { }

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > this.maxLength) {
      throw new BadRequestException(
        ErrorCode.BAD_REQUEST__STRING_TOO_LONG,
        `${this.maxLength}자 이하로 입력해주세요.`,
      );
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly minLength: number) { }

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length < this.minLength) {
      throw new BadRequestException(
        ErrorCode.BAD_REQUEST__STRING_TOO_SHORT,
        `${this.minLength}자 이상으로 입력해주세요.`,
      );
    }
    return value.toString();
  }
}
