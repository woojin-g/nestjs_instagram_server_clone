import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";
import { IsBoolean, IsString } from "class-validator";
import { IsOptional } from "class-validator";
import { Type } from "class-transformer";

// PickType, OmitType, PartialType 등을 활용하여 DTO를 구현할 수 있다.

export class UpdatePostDto extends PartialType(CreatePostDto) { }

