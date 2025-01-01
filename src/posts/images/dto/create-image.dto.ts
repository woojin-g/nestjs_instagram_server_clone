import { PickType } from "@nestjs/mapped-types";
import { ImageModel } from "src/common/entity/image.entity";

export class CreatePostImageDto extends PickType(
  ImageModel,
  [
    'order',
    'type',
    'path',
    'post',
  ],
) { }