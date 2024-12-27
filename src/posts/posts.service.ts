import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { PostsModel } from './entities/posts.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostsModel)
    private readonly postsRepository: Repository<PostsModel>,
  ) {}

  async getAllPosts(): Promise<PostsModel[]> {
    return this.postsRepository.find({ relations: ['author'] });
  }

  async getPostById(id: number): Promise<PostsModel> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async createPost(
    authorId: number,
    title: string,
    content: string,
  ): Promise<PostsModel> {
    if (!authorId || !title || !content) {
      throw new BadRequestException();
    }
    const postData = this.postsRepository.create({
      author: { id: authorId },
      title,
      content,
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
            'NOT_FOUND_USER',
            '존재하지 않는 사용자입니다.',
          );
        }
      }
      throw new InternalServerErrorException(
        'INTERNAL_SERVER_ERROR',
        '서버 오류',
      );
    }
  }

  async updatePost(
    id: number,
    title?: string,
    content?: string,
  ): Promise<PostsModel> {
    const foundPost = await this.postsRepository.findOneBy({ id: id });
    if (!foundPost) {
      throw new NotFoundException();
    }
    foundPost.title = title ?? foundPost.title;
    foundPost.content = content ?? foundPost.content;
    const updatedPost = await this.postsRepository.save(foundPost);
    return updatedPost;
  }

  async deletePost(id: number): Promise<number> {
    const foundPost = await this.postsRepository.findOneBy({ id: id });
    if (!foundPost) {
      throw new NotFoundException();
    }
    await this.postsRepository.delete(id);
    return foundPost.id;
  }
}
