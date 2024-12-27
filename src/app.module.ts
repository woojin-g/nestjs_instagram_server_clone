import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
