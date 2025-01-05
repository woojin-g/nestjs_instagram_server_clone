import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentModel } from './entity/comments.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { CommentsPaginationRequestDto } from './dto/comments-pagination.dto';
import { CursorPaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { CommonService } from 'src/common/common.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CustomException } from 'src/common/exception-filter/custom-exception';
import { ErrorCode } from 'src/common/const/error.const';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentModel)
    private readonly commentsRepository: Repository<CommentModel>,
    private readonly commonService: CommonService,
  ) { }

  paginateComments(
    postId: number,
    dto: CommentsPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<CommentModel> | CursorPaginationResponseDto<CommentModel>> {
    return this.commonService.paginate(
      dto,
      this.commentsRepository,
      {
        where: { post: { id: postId } },
        relations: { author: true },
        select: {
          author: { id: true, nickname: true },
        }
      },
      `posts/${postId}/comments`,
    );
  }

  async getCommentById(commentId: number): Promise<CommentModel> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: { author: true, post: true },
      select: {
        author: { id: true, nickname: true },
        post: { id: true },
      }
    });
    if (!comment) {
      throw new CustomException(ErrorCode.NOT_FOUND__COMMENT);
    }
    return comment;
  }

  async createComment(
    userId: number,
    postId: number,
    dto: CreateCommentDto,
  ): Promise<CommentModel> {
    const comment = await this.commentsRepository.save({
      author: { id: userId },
      post: { id: postId },
      ...dto,
    });
    return this.getCommentById(comment.id);
  }

  async updateComment(
    commentId: number,
    dto: UpdateCommentDto,
  ): Promise<CommentModel> {
    // preload : ID를 기준으로 기존 엔티티를 조회하고, 입력받은 새로운 값들로 업데이트한다.
    const comment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    })
    if (!comment) {
      throw new CustomException(ErrorCode.NOT_FOUND__COMMENT);
    }
    return this.commentsRepository.save(comment);
  }

  async deleteComment(
    commentId: number,
  ): Promise<number> {
    await this.getCommentById(commentId);
    await this.commentsRepository.delete(commentId);
    return commentId;
  }
}
