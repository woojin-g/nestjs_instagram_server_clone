import { PickType } from "@nestjs/mapped-types";
import { PostModel } from "../entity/posts.entity";
import { IsOptional, IsString } from "class-validator";
import { stringValidationMessage } from "src/common/validation-message/validation-message";

// PickType, OmitType, PartialType 등을 활용하여 DTO를 구현할 수 있다.
// ! 실제 개발 시, DTO와 Entity는 분리하여 작성하는 것이 좋다.
export class CreatePostDto extends PickType(PostModel, ['title', 'content']) {
  @IsString({
    // DTO 구성 시, images 배열의 각 요소 또한 문자열인지 검증
    each: true,
    message: stringValidationMessage,
  })
  @IsOptional()
  images: string[] = [];
}
