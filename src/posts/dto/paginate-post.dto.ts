import { PostsModel } from "../entity/posts.entity";
import { BasePaginationDto } from "src/common/dto/base-pagination.dto";

export class PaginatePostRequestDto extends BasePaginationDto { }

export class PaginatePostResponseDto {
  data: PostsModel[];
}

export class PagePaginatePostResponseDto extends PaginatePostResponseDto {
  total: number;
}

export class CursorPaginatePostResponseDto extends PaginatePostResponseDto {
  count: number;
  cursor: {
    nextPostId?: number;
  };
  nextUrl: string;
}
