import { IsIn, IsNumber, IsOptional } from "class-validator";
import { numberValidationMessage } from "src/common/validation-message/validation-message";
import { PostsModel } from "../entity/posts.entity";
import { Type } from "class-transformer";

export class PaginatePostRequestDto {
  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  where__id_more_than?: number;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order__createdAt?: 'ASC' = 'ASC';

  @IsNumber({}, { message: numberValidationMessage })
  @IsOptional()
  take: number = 20;
}

export class PaginatePostResponseDto {
  data: PostsModel[];
}