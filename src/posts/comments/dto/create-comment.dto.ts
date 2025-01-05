import { PickType } from "@nestjs/mapped-types";
import { CommentModel } from "../entity/comments.entity";

export class CreateCommentDto extends PickType(CommentModel, ['content']) { }
