import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RestApiExceptionFilter } from './common/exception-filter/rest-api.exception-filter';
import { LogInterceptor } from './common/interceptor/log.interceptor';
import { defaultValidationPipeOptions } from './common/validation-pipe/validation-pipe-options';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DTO 사용을 위해 class-validator를 전역적으로 적용한다. (REST API 한정)
  app.useGlobalPipes(new ValidationPipe(defaultValidationPipeOptions));
  app.useGlobalInterceptors(new LogInterceptor());
  app.useGlobalFilters(new RestApiExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
