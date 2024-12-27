import { ArgumentMetadata, BadRequestException, Inject, Injectable, PipeTransform } from "@nestjs/common";

// @Injectable()
// export class PasswordPipe implements PipeTransform {
//   transform(value: any, metadata: ArgumentMetadata) {
//     if (value.toString().length > 8) {
//       throw new BadRequestException('PASSWORD_TOO_LONG', '비밀번호는 8자 이하로 입력해주세요.');
//     }
//     return value.toString();
//   }
// }

@Injectable()
export class MaxLengthPipe implements PipeTransform {
  constructor(private readonly maxLength: number) { }

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length > this.maxLength) {
      throw new BadRequestException('STRING_TOO_LONG', `${this.maxLength}자 이하로 입력해주세요.`);
    }
    return value.toString();
  }
}

@Injectable()
export class MinLengthPipe implements PipeTransform {
  constructor(private readonly minLength: number) { }

  transform(value: any, metadata: ArgumentMetadata) {
    if (value.toString().length < this.minLength) {
      throw new BadRequestException('STRING_TOO_SHORT', `${this.minLength}자 이상으로 입력해주세요.`);
    }
    return value.toString();
  }
}