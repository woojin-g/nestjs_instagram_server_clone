import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModel } from './entity/posts.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { ImageModel } from 'src/common/entity/image.entity';
import { PostsImagesService } from './images/images.service';
import { LogMiddleware } from 'src/common/middleware/log.middleware';


@Module({
  imports: [
    // provider에 Repository를 주입
    TypeOrmModule.forFeature([
      PostModel,
      ImageModel,
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})

// PostsModule에 Middleware 적용
export class PostsModule implements NestModule {
  // Middleware 적용
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes({
      // 라우트가 posts인 경우에만 적용
      // path: 'posts',
      // 라우트가 posts로 시작하는 모든 경우에 대해 적용
      path: 'posts*',
      // GET 요청에만 적용
      method: RequestMethod.GET,
    });
  }
}
