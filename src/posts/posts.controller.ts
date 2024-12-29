import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entity/posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';

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
  @UseGuards(AccessTokenGuard)
  postPosts(
    @User('id') userId: number,
    @Body(new ValidationPipe({ transform: true })) createPostDto: CreatePostDto,
  ): Promise<PostsModel> {
    return this.postsService.createPost(
      userId,
      createPostDto,
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
