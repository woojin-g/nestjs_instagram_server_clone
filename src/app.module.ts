import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entity/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    // TypeORM과 NestJS를 연결
    TypeOrmModule.forRoot({
      // 데이터베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      // ! 배포 환경에서는 환경변수로 설정
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [UsersModel, PostsModel],
      // ORM이 데이터베이스 스키마를 자동으로 동기화
      // ! 개발 환경에서만 사용
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      // ClassSerializerInterceptor는 엔티티나 DTO 클래스에서 @Exclude(), @Expose() 등의 데코레이터로 표시된 속성들을 처리한다.
      // 앱 전반적으로 적용하기 위해 전역 인터셉터로 설정한다.
      useClass: ClassSerializerInterceptor,
    }
  ],
})
export class AppModule { }
