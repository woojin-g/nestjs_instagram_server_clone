import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsWhere, LessThan, MoreThan, QueryFailedError, Repository } from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { ErrorCode } from 'src/common/const/error.const';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostRequestDto, CursorPaginatePostResponseDto, PagePaginatePostResponseDto, PaginatePostResponseDto } from './dto/paginate-post.dto';
import { HOST, PROTOCOL } from 'src/common/const/env.const';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  async paginatePosts(dto: PaginatePostRequestDto): Promise<PaginatePostResponseDto> {
    if (dto.page) {
      return this.pagePaginatePosts(dto);
    }
    return this.cursorPaginatePosts(dto);
  }

  // 페이지 기반 페이지네이션
  private async pagePaginatePosts(dto: PaginatePostRequestDto): Promise<PagePaginatePostResponseDto> {
    const [data, total] = await this.postsRepository.findAndCount({
      // page는 1부터 시작
      skip: dto.take * (dto.page - 1),
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    return {
      data,
      total,
    };
  }

  // 커서 기반 페이지네이션
  private async cursorPaginatePosts(dto: PaginatePostRequestDto): Promise<CursorPaginatePostResponseDto> {
    const where: FindOptionsWhere<PostsModel> = {};

    // ? createAt 기준으로 정렬하고 있으니 ID 기준으로 조회하는 것은 잘못된 것 아닌가?
    if (dto.where__id__less_than) {
      where.id = LessThan(dto.where__id__less_than);
    }
    else if (dto.where__id__more_than) {
      where.id = MoreThan(dto.where__id__more_than);
    }

    const data = await this.postsRepository.find({
      where: where,
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });

    const count = data.length;
    const lastItem = data.length > 0 && data.length === dto.take ? data[data.length - 1] : null;
    const cursor = {
      nextPostId: lastItem?.id ?? null,
    };

    const nextUrl = lastItem && new URL(`${PROTOCOL}://${HOST}/posts`);
    if (nextUrl) {
      for (const key of Object.keys(dto)) {
        if (dto[key] && key !== 'where__id__more_than' && key !== 'where__id__less_than') {
          nextUrl.searchParams.append(key, dto[key]);
        }
      }

      let key = null;
      if (dto.order__createdAt == 'ASC') {
        key = 'where__id__more_than';
      } else if (dto.order__createdAt == 'DESC') {
        key = 'where__id__less_than';
      }
      nextUrl.searchParams.append(key, lastItem.id.toString());
    }

    return {
      data,
      count,
      cursor,
      nextUrl: nextUrl?.toString() ?? null,
    };
  }

  async getPostById(id: number): Promise<PostsModel> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(ErrorCode.NOT_FOUND_POST, '존재하지 않는 게시글입니다.');
    }
    return post;
  }

  async createPost(
    authorId: number,
    dto: CreatePostDto,
  ): Promise<PostsModel> {
    if (!authorId || !dto.title || !dto.content) {
      throw new BadRequestException(ErrorCode.BAD_REQUEST, '잘못된 요청입니다.');
    }
    const postData = this.postsRepository.create({
      author: { id: authorId },
      ...dto,
      likeCount: 0,
      commentCount: 0,
    });
    try {
      const createdPost = await this.postsRepository.save(postData);
      return createdPost;
    } catch (error) {
      console.log(error);
      if (error instanceof QueryFailedError) {
        if (error.driverError.code == '23503') {
          throw new NotFoundException(
            ErrorCode.NOT_FOUND_USER,
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
  ): Promise<PostsModel> {
    const foundPost = await this.postsRepository.findOneBy({ id: id });
    if (!foundPost) {
      throw new NotFoundException(ErrorCode.NOT_FOUND_POST, '존재하지 않는 게시글입니다.');
    }
    foundPost.title = dto.title ?? foundPost.title;
    foundPost.content = dto.content ?? foundPost.content;
    const updatedPost = await this.postsRepository.save(foundPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<number> {
    const foundPost = await this.postsRepository.findOneBy({ id: id });
    if (!foundPost) {
      throw new NotFoundException(ErrorCode.NOT_FOUND_POST, '존재하지 않는 게시글입니다.');
    }
    await this.postsRepository.delete(id);
    return foundPost.id;
  }

  async generatePosts(userId: number) {
    for (let i = 0; i < 100; i++) {
      await this.createPost(userId, {
        title: `title ${i}`,
        content: `content ${i}`,
      });
    }
  }
}
