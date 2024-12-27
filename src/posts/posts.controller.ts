import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entities/posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(): Promise<PostsModel[]> {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPostById(
    @Param(
      'id',
      // Pipe 클래스를 상속하여 커스텀 Pipe를 만들 수 있다.
      ParseIntPipe,
    )
    id: number,
  ): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  postPosts(
    @Body('authorId') authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
  ): Promise<PostsModel> {
    return this.postsService.createPost(authorId, title, content);
  }

  @Put(':id')
  putPosts(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ): Promise<PostsModel> {
    return this.postsService.updatePost(+id, title, content);
  }

  @Delete(':id')
  deletePosts(@Param('id') id: string): Promise<number> {
    return this.postsService.deletePost(+id);
  }
}
