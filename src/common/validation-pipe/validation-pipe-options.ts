import { ValidationPipeOptions } from "@nestjs/common";

export const defaultValidationPipeOptions: ValidationPipeOptions = {
  // DTO로 변환 시 각 프로퍼티의 타입 변환을 허용한다.
  transform: true,
  transformOptions: {
    // 타입 변환을 자동으로 적용한다.
    // 이 옵션 없이, 각 프로퍼티별로 타입변환을 적용할 수도 있다.
    // ex.
    //   - @Type(() => Number)
    //   - @Transform(({ value }) => Number(value))
    enableImplicitConversion: true,
  },
  // 요청에 포함된 프로퍼티 중, 데코레이터가 적용되지 않은 프로퍼티는 제거한다.
  // 즉, 서버에서 의도하지 않은 프로퍼티를 클라이언트가 전달하는 것을 방지한다.
  whitelist: true,
  // 요청에 포함된 프로퍼티 중, 데코레이터가 적용되지 않은 프로퍼티가 있으면 예외를 발생시킨다.
  forbidNonWhitelisted: true,
}