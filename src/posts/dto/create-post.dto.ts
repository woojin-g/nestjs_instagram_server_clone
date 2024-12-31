import { PickType } from "@nestjs/mapped-types";
import { PostsModel } from "../entity/posts.entity";
import { IsOptional, IsString } from "class-validator";

// PickType, OmitType, PartialType 등을 활용하여 DTO를 구현할 수 있다.

export class CreatePostDto extends PickType(PostsModel, ['title', 'content']) {
  @IsString()
  @IsOptional()
  image?: string;
}
