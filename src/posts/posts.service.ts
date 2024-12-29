import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MoreThan, QueryFailedError, Repository } from 'typeorm';
import { PostsModel } from './entity/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { ErrorCode } from 'src/common/const/error.const';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostRequestDto, PaginatePostResponseDto } from './dto/paginate-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  // async getAllPosts(): Promise<PostsModel[]> {
  //   return this.postsRepository.find({ relations: ['author'] });
  // }

  async paginatePosts(dto: PaginatePostRequestDto): Promise<PaginatePostResponseDto> {
    const data = await this.postsRepository.find({
      where: {
        id: MoreThan(dto.where__id_more_than ?? 0),
      },
      order: {
        createdAt: dto.order__createdAt,
      },
      take: dto.take,
    });
    return {
      data,
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
