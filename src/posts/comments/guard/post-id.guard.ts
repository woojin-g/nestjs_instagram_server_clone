import { CanActivate } from "@nestjs/common";

import { Injectable } from "@nestjs/common";

import { ExecutionContext } from "@nestjs/common";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { PostsService } from "src/posts/posts.service";

@Injectable()
export class PostIdGuard implements CanActivate {
  constructor(
    private readonly postsService: PostsService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const postId = req.params.postId;
    if (!postId) {
      throw new CustomException(ErrorCode.BAD_REQUEST);
    }
    const exists = await this.postsService.checkPostExistsById(postId);
    if (!exists) {
      throw new CustomException(ErrorCode.NOT_FOUND__POST);
    }
    return true;
  }
}