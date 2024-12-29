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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsModel } from './entity/posts.entity';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { User } from 'src/users/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostRequestDto, PaginatePostResponseDto } from './dto/paginate-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @Get()
  @UseGuards(AccessTokenGuard)
  getPosts(
    @Query() body: PaginatePostRequestDto,
  ): Promise<PaginatePostResponseDto> {
    return this.postsService.paginatePosts(body);
  }

  @Get(':id')
  @UseGuards(AccessTokenGuard)
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
    @Body() body: CreatePostDto,
  ): Promise<PostsModel> {
    return this.postsService.createPost(
      userId,
      body,
    );
  }

  @Patch(':id')
  @UseGuards(AccessTokenGuard)
  patchPosts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
  ): Promise<PostsModel> {
    return this.postsService.updatePost(id, body);
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  deletePosts(@Param('id', ParseIntPipe) id: number): Promise<number> {
    return this.postsService.deletePost(id);
  }

  @Post('random')
  @UseGuards(AccessTokenGuard)
  async postRandomPosts(
    @User('id') userId: number,
  ): Promise<boolean> {
    await this.postsService.generatePosts(userId);
    return true;
  }
}
