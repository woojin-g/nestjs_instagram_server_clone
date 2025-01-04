import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, QueryRunner, Repository } from 'typeorm';
import { PostModel } from './entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { ErrorCode } from 'src/common/const/error.const';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsPaginationRequestDto } from './dto/posts-pagination.dto';
import { CommonService } from 'src/common/common.service';
import { CursorPaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { PagePaginationResponseDto } from 'src/common/dto/base-pagination.dto';
import { POSTS_FOLDER_ABSOLUTE_PATH, TEMP_FOLDER_ABSOLUTE_PATH } from 'src/common/const/path.const';
import { basename, join } from 'path';
import { promises } from 'fs';
import { CreatePostImageDto } from './images/dto/create-image.dto';
import { ImageModel } from 'src/common/entity/image.entity';
import { DEFAULT_POST_FIND_OPTIONS } from './const/default-post-find-options.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostModel)
    private readonly postsRepository: Repository<PostModel>,
    @InjectRepository(ImageModel)
    private readonly imagesRepository: Repository<ImageModel>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly commonService: CommonService,
  ) { }

  getRepository(qr?: QueryRunner): Repository<PostModel> {
    // 동일한 트랜잭션 내에서 데이터베이스 작업을 수행하기 위해서는 QueryRunner의 Repository를 사용해야 한다.
    // 그 외의 일반적인 경우에는 기본 Repository를 사용한다.
    return qr ? qr.manager.getRepository(PostModel) : this.postsRepository;
  }

  async paginatePosts(
    dto: PostsPaginationRequestDto,
  ): Promise<PagePaginationResponseDto<PostModel> | CursorPaginationResponseDto<PostModel>> {
    return this.commonService.paginate(
      dto,
      this.postsRepository,
      DEFAULT_POST_FIND_OPTIONS,
      'posts',
    );
  }

  async getPostById(id: number, qr?: QueryRunner): Promise<PostModel> {
    const repository = this.getRepository(qr);
    const post = await repository.findOne({
      where: { id },
      ...DEFAULT_POST_FIND_OPTIONS,
    });
    if (!post) {
      throw new NotFoundException(
        ErrorCode.NOT_FOUND__POST,
        '존재하지 않는 게시글입니다.',
      );
    }
    return post;
  }

  async createPost(
    authorId: number,
    dto: CreatePostDto,
    qr?: QueryRunner,
  ): Promise<PostModel> {
    if (!authorId || !dto.title || !dto.content) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    const repository = this.getRepository(qr);
    const postData = repository.create({
      author: { id: authorId },
      ...dto,
      // 이후 createPostImage 함수에서 ImageModel 생성 시, PostModel과 자동으로 연결되어 이 배열에 추가된다.
      images: [],
      likeCount: 0,
      commentCount: 0,
    });
    try {
      const createdPost = await repository.save(postData);
      return createdPost;
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        if (error.driverError.code == '23503') {
          throw new NotFoundException(
            ErrorCode.NOT_FOUND__USER,
            '존재하지 않는 사용자입니다.',
          );
        }
      }
      throw new InternalServerErrorException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        '서버 오류',
      );
    }
  }

  async updatePost(
    id: number,
    dto: UpdatePostDto,
  ): Promise<PostModel> {
    const foundPost = await this.postsRepository.findOne({
      where: { id },
      ...DEFAULT_POST_FIND_OPTIONS,
    });
    if (!foundPost) {
      throw new NotFoundException(
        ErrorCode.NOT_FOUND__POST,
        '존재하지 않는 게시글입니다.',
      );
    }
    foundPost.title = dto.title ?? foundPost.title;
    foundPost.content = dto.content ?? foundPost.content;
    const updatedPost = await this.postsRepository.save(foundPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<number> {
    const foundPost = await this.postsRepository.findOne({
      where: { id },
      ...DEFAULT_POST_FIND_OPTIONS,
    });
    if (!foundPost) {
      throw new NotFoundException(
        ErrorCode.NOT_FOUND__POST,
        '존재하지 않는 게시글입니다.',
      );
    }
    await this.postsRepository.delete(id);
    return foundPost.id;
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `title ${i}`,
        content: `content ${i}`,
        images: [],
      });
    }
  }
}
