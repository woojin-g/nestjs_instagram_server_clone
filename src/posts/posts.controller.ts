import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entity/posts.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  getPosts(): Promise<PostsModel[]> {
    return this.postsService.getAllPosts();
  }

  @Get(':id')
  getPostById(
    // Pipe는 Injectable 이므로 자동으로 주입됨
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<PostsModel> {
    return this.postsService.getPostById(id);
  }

  @Post()
  postPosts(
    @Body('authorId', ParseIntPipe) authorId: number,
    @Body('title') title: string,
    @Body('content') content: string,
    // Pipe를 인스턴스화 하여 넣어줄 경우, 호출할 때마다 새로 인스턴스화 되어 주입됨
    @Body('isPublic', new DefaultValuePipe(true)) isPublic: boolean,
  ): Promise<PostsModel> {
    return this.postsService.createPost(
      authorId,
      title,
      content,
      isPublic,
    );
  }

  @Put(':id')
  putPosts(
    @Param('id', ParseIntPipe) id: number,
    @Body('title') title?: string,
    @Body('content') content?: string,
  ): Promise<PostsModel> {
    return this.postsService.updatePost(id, title, content);
  }

  @Delete(':id')
  deletePosts(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.postsService.deletePost(id);
  }
}
