import { CanActivate, ExecutionContext, Injectable, mixin } from "@nestjs/common";
import { AccessTokenRestApiGuard } from "src/auth/guard/bearer-token.rest-api.guard";
import { ErrorCode } from "src/common/const/error.const";
import { CustomException } from "src/common/exception-filter/custom-exception";
import { UserRoleType } from "src/users/const/users.const";
import { UserModel } from "src/users/entity/users.entity";
import { Request } from "express";
import { ResourceOwnerChecker } from "../interface/resource-owner-checker.interface";
import { PostsService } from "src/posts/posts.service";
import { CommentsService } from "src/posts/comments/comments.service";

/**
 * 리소스 소유자 검증
 * 
 * 구체적인 모듈에서 사용하려면,
 *   export class ModuleResourceOwnerGuard extends ResourceOwnerGuard<ModuleService> { }
 * 와 같은 형태로 상속하여 사용한다.
 * 또한, 서비스 클래스는 ResourceOwnerChecker 인터페이스를 구현해야 한다.
 */
@Injectable()
export class ResourceOwnerGuard<T extends ResourceOwnerChecker> implements CanActivate {
  constructor(
    private readonly resourceOwnerChecker: T,
    private readonly paramName: string = 'id',
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & { user: UserModel };
    const { user } = req;
    if (!user) {
      throw new CustomException(
        ErrorCode.INTERNAL_SERVER_ERROR,
        `${ResourceOwnerGuard.name}를 사용하려면 ${AccessTokenRestApiGuard.name}를 사용해야 합니다.`,
      );
    }

    if (user.role === UserRoleType.ADMIN) {
      return true;
    }

    const resourceId = +req.params[this.paramName];
    if (!resourceId) {
      throw new CustomException(ErrorCode.BAD_REQUEST, `경로 매개변수로 ${this.paramName}를 전달해야 합니다.`);
    }

    const isOwner = await this.resourceOwnerChecker.checkResourceOwner(resourceId, user.id);
    if (!isOwner) {
      throw new CustomException(ErrorCode.FORBIDDEN__NOT_RESOURCE_OWNER);
    }
    return true;
  }
}

/**
 * 게시글 작성자 검증
 */
@Injectable()
export class PostsResourceOwnerGuard extends ResourceOwnerGuard<PostsService> {
  constructor(
    private readonly postsService: PostsService,
  ) {
    super(postsService, 'postId');
  }
}

/**
 * 댓글 작성자 검증
 */
@Injectable()
export class CommentsResourceOwnerGuard extends ResourceOwnerGuard<CommentsService> {
  constructor(
    private readonly commentsService: CommentsService,
  ) {
    super(commentsService, 'commentId');
  }
}