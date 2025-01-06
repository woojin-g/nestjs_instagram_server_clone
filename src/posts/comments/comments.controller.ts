import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { CommentModel } from './entity/comments.entity';
import { CommentsPaginationRequestDto } from './dto/comments-pagination.dto';
import { CursorPaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { User } from 'src/users/decorator/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostIdGuard } from './guard/post-id.guard';
import { CommentsResourceOwnerGuard } from 'src/common/guard/resource-owner.guard';

/**
 * postId 검증 방법
 * 1. Guard : 주로 인증/인가 목적으로 사용되나, 파라미터 검증에 사용하는 것도 가능하며, 컨트롤러 전반에 대해 적용할 수 있어 적합하다.
 * 2. Middleware : 파라미터 검증에도 사용 가능하나, 너무 로우레벨이며, 라우트 파라미터에 대한 검증보다는 전역적인 처리에 더 적합하다.
 * 3. Pipe : 파라미터 검증의 경우, Pipe를 사용하는 것이 가장 적절하나, 컨트롤러 전반에 대해 적용하기는 어렵다.
 * 4. Interceptor : 주로 요청/응답 젼환, 캐싱, 로깅 등에 사용되며, 파라미터 검증에는 적합하지 않다.
 */
@Controller('posts/:postId/comments')
@UseGuards(PostIdGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Get()
  getComments(
    @Param('postId') postId: number,
    @Query() dto: CommentsPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<CommentModel> | CursorPaginationResponseDto<CommentModel>> {
    return this.commentsService.paginateComments(postId, dto);
  }

  @Get(':commentId')
  getCommentById(
    @Param('commentId') commentId: number,
  ): Promise<CommentModel> {
    return this.commentsService.getCommentById(commentId);
  }

  @Post()
  postComment(
    @User('id') userId: number,
    @Param('postId') postId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentModel> {
    return this.commentsService.createComment(userId, postId, dto);
  }

  @Patch(':commentId')
  @UseGuards(CommentsResourceOwnerGuard)
  patchComment(
    @Param('commentId') commentId: number,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentModel> {
    return this.commentsService.updateComment(commentId, dto);
  }

  @Delete(':commentId')
  @UseGuards(CommentsResourceOwnerGuard)
  deleteComment(
    @Param('commentId') commentId: number,
  ): Promise<number> {
    return this.commentsService.deleteComment(commentId);
  }
}
