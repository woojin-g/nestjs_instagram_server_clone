import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostModel } from './entity/posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsPaginationRequestDto } from './dto/posts-pagination.dto';
import { CursorPaginationResponseDto, PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource } from 'typeorm';
import { PostsImagesService } from './images/images.service';
import { LogInterceptor } from 'src/common/interceptor/log.interceptor';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly postsImagesService: PostsImagesService,
    // DataSourcesm는 주로, 아래와 같은 용도로 사용한다.
    // - 데이터베이스 연결 관리
    // - 데이터베이스 메타데이터 접근
    // - 트랜잭션 관리
    // - 쿼리 실행
    // - 엔티티 관리
    // - 마이그레이션 도구 실행
    // - 이벤트 구독
    // 즉, 데이터베이스의 기능을 애플리케이션 코드 레벨에서 접근하고자 할 때 사용한다.
    private readonly dataSource: DataSource,
  ) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(LogInterceptor)
  getPosts(
    @Query() body: PostsPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<PostModel> | CursorPaginationResponseDto<PostModel>> {
    return this.postsService.paginatePosts(body);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  getPostById(
    // Pipe는 Injectable 이므로 자동으로 주입됨
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<PostModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
  ): Promise<PostModel> {
    // 트랜잭션과 관련된 모든 쿼리를 담당할 쿼리 러너를 생성한다.
    const qr = this.dataSource.createQueryRunner();
    // 쿼리 러너를 데이터베이스에 연결한다.
    await qr.connect();
    // 트랜잭션을 시작한다.
    await qr.startTransaction();

    try {
      // PostModel 먼저 생성
      const post = await this.postsService.createPost(userId, body, qr);

      // 모든 이미지들에 대해 ImageModel 생성 + PostModel과 연결
      await Promise.all(
        body.images.map((image, index) =>
          this.postsImagesService.createPostImage(
            {
              order: index,
              type: ImageModelType.POST,
              path: image,
              post,
            },
            qr,
          ),
        ),
      );

      // 트랜잭션 종료 후 커밋
      await qr.commitTransaction();

      return this.postsService.getPostById(post.id);
    }
    catch (error) {
      // 트랜잭션 종료 후 롤백
      await qr.rollbackTransaction();
      throw error;
    }
    finally {
      // 쿼리 러너 연결 해제
      await qr.release();
    }
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  patchPosts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ): Promise<PostModel> {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  deletePosts(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.postsService.deletePost(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postRandomPosts(
    @User('id') userId: number,
  ): Promise<boolean> {
    await this.postsService.generatePosts(userId);
    return true;
  }
}
