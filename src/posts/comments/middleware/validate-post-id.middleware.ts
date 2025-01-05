import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { PostsService } from "src/posts/posts.service";

@Injectable()
export class ValidatePostIdMiddleware implements NestMiddleware {
  constructor(private readonly postsService: PostsService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;
    if (!postId) {
      throw new CustomException(ErrorCode.BAD_REQUEST, 'postId 파라미터는 필수입니다.');
    }
    const exists = await this.postsService.checkPostExistsById(+postId);
    if (!exists) {
      throw new CustomException(ErrorCode.NOT_FOUND__POST);
    }
    next();
  }
}
