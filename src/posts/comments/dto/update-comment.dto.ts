import { PartialType, PickType } from "@nestjs/mapped-types";
import { CommentModel } from "../entity/comments.entity";
import { CreateCommentDto } from "./create-comment.dto";

export class UpdateCommentDto extends PartialType(CreateCommentDto) { }