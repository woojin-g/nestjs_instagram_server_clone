import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class PasswordPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > 8) {
      throw new BadRequestException('PASSWORD_TOO_LONG', '비밀번호는 8자 이하로 입력해주세요.');
    }
    return value.toString();
  }
}