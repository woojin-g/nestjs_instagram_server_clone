import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentModel } from './entity/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { CommonModule } from 'src/common/common.module';
import { PostsModule } from '../posts.module';
import { ValidatePostIdMiddleware } from './middleware/validate-post-id.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentModel]),
    AuthModule,
    UsersModule,
    CommonModule,
    PostsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule { }

// ValidatePostIdMiddleware를 CommentsController의 모든 API에 적용하는 방법
// export class CommentsModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(ValidatePostIdMiddleware)
//       .forRoutes(CommentsController);
//   }
// }
