import {
  Body,
  Controller,
  Delete,
  Get,
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
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsPaginationRequestDto } from './dto/posts-pagination.dto';
import { CursorPaginationResponseDto, PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { ImageModelType } from 'src/common/entity/image.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './images/images.service';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { UserRoleType } from 'src/users/const/users.const';
import { UserRole } from 'src/users/decorator/user-role.decorator';
import { IsPublic } from 'src/common/decorator/is-public.decorator';
import { PostsResourceOwnerGuard, ResourceOwnerGuard } from '../common/guard/resource-owner.guard';

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
  @IsPublic() // 액세스 토큰 없이 접근 가능
  getPosts(
    @Query() dto: PostsPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<PostModel> | CursorPaginationResponseDto<PostModel>> {
    return this.postsService.paginatePosts(dto);
  }

  @Get(':postId')
  @IsPublic() // 액세스 토큰 없이 접근 가능
  getPostById(
    // Pipe는 Injectable 이므로 자동으로 주입됨
    @Param('postId', ParseIntPipe)
    id: number,
  ): Promise<PostModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @QueryRunner() queryRunner: QR,
    @User('id') userId: number,
    @Body() body: CreatePostDto,
  ): Promise<PostModel> {
    // PostModel 먼저 생성
    const post = await this.postsService.createPost(userId, body, queryRunner);

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
          queryRunner,
        ),
      ),
    );

    // 트랜잭션이 완전히 커밋되기 전에 조회할 경우 조회 결과가 없을 수 있으므로,
    // 마찬가지로 QueryRunner를 사용해서 조회한다.
    return this.postsService.getPostById(post.id, queryRunner);
  }

  @Patch(':postId')
  @UseGuards(PostsResourceOwnerGuard)
  patchPosts(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() body: UpdatePostDto,
  ): Promise<PostModel> {
    return this.postsService.updatePost(postId, body);
  }

  @Delete(':postId')
  @UserRole(UserRoleType.ADMIN) // Amin 권한인 경우에 삭제 가능
  deletePosts(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<number> {
    return this.postsService.deletePost(postId);
  }

  @Post('random')
  async postRandomPosts(
    @User('id') userId: number,
  ): Promise<boolean> {
    await this.postsService.generatePosts(userId);
    return true;
  }
}
