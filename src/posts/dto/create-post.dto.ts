import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty } from "class-validator";

import { IsString } from "class-validator";

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  @IsNotEmpty()
  // null인 경우, true로 변환
  @Transform(({ value }) => value ?? true)
  isPublic: boolean = true;
}
