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
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PUBLIC_FOLDER_ABSOLUTE_PATH } from './common/const/path.const';
import { ImageModel } from './common/entity/image.entity';
import { LogMiddleware } from './common/middleware/log.middleware';
import { ChatRoomsModule } from './chat-rooms/chat-rooms.module';
import { ChatRoomModel } from './chat-rooms/entity/chat-rooms.entity';
import { ChatMessageModel } from './chat-rooms/chat-messages/entity/chat-messages.entity';
import { CommentsModule } from './posts/comments/comments.module';
import { CommentModel } from './posts/comments/entity/comments.entity';
import { UserRoleGuard } from './users/guard/user-role.guard';
import { AccessTokenRestApiGuard } from './auth/guard/bearer-token.rest-api.guard';
import { FollowRelationModel } from './users/entity/follow-relation.entity';

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
        CommentModel,
        FollowRelationModel,
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
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      // ClassSerializerInterceptor는 엔티티나 DTO 클래스에서 @Exclude(), @Expose() 등의 데코레이터로 표시된 속성들을 처리한다.
      // 앱 전반적으로 동일한 직렬화 규칙을 적용하기 위해 전역 인터셉터로 설정한다.
      useClass: ClassSerializerInterceptor,
    },
    // 해당 Guard가 전역적으로 적용되도록 한다.
    // 이는 곧, 기본적으로 모든 API 호출을 보호하는 것을 의미한다.
    // 대신, 토큰 없이 접근 가능한 API는 @IsPublic() 데코레이터를 사용해 보안에서 제외시킨다.
    // 이것이 가능한 이유는, 데코레이터의 실행은 코드가 메모리에 로드되는 시점이고, guard가 실행되는 시점은 요청이 들어오는 시점이기 때문이다.
    //
    // 전역적으로 적용된 Guard는 API 함수에 적용한 Guard 보다 먼저 실행된다.
    //  : AccessTokenRestApiGuard를 개별 API 함수에 적용할 경우, UserRoleGuard가 AccessTokenRestApiGuard 보다 먼저 실행되어,
    //    UserRoleGuard 내부에서 user 인스턴스에 접근할 수 없다.
    {
      provide: APP_GUARD,
      useClass: AccessTokenRestApiGuard,
    },
    {
      provide: APP_GUARD,
      // 모든 API 호출에 대해, @UserRole 데코레이터를 통해 설정된 메타데이터를 확인하여 권한 검증을 수행
      useClass: UserRoleGuard,
    },
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