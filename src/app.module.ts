import { ClassSerializerInterceptor, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModel } from './posts/entity/posts.entity';
import { UsersModule } from './users/users.module';
import { UserModel } from './users/entity/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_ABSOLUTE_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddleware } from './common/middleware/log.middleware';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { ChatRoomModel } from './chat-rooms/entity/chat-rooms.entity';
import { ChatMessageModel } from './chat-rooms/chat-messages/entity/chat-messages.entity';

@Module({
  imports: [
    // 환경변수 적용
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_FOLDER_ABSOLUTE_PATH,
      serveRoot: '/public',
    }),
    // TypeORM과 NestJS를 연결
    TypeOrmModule.forRoot({
      // 데이터베이스 정보 설정
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // 사용할 모든 엔티티를 등록해야 함
      entities: [
        UserModel,
        PostModel,
        ImageModel,
        ChatRoomModel,
        ChatMessageModel,
      ],
      // ORM이 데이터베이스 스키마를 자동으로 동기화
      // ! 개발 환경에서만 사용
      synchronize: true,
    }),
    UsersModule,
    PostsModule,
    AuthModule,
    CommonModule,
    ChatRoomsModule,
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

// AppModule에 Middleware 적용
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 모든 요청에 적용
    consumer.apply(LogMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}