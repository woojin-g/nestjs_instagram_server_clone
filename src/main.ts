import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DTO 사용을 위해 class-validator를 전역적으로 적용한다.
  app.useGlobalPipes(new ValidationPipe({
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
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
