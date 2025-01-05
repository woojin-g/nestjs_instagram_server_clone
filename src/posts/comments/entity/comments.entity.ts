import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { BaseModel } from "src/common/entity/base.entity";
import { notEmptyValidationMessage, numberValidationMessage } from "src/common/validation-pipe/validation-pipe-message";
import { stringValidationMessage } from "src/common/validation-pipe/validation-pipe-message";
import { PostModel } from "src/posts/entity/posts.entity";
import { UserModel } from "src/users/entity/users.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class CommentModel extends BaseModel {
  @ManyToOne(() => UserModel, (user) => user.comments)
  author: UserModel;

  @ManyToOne(
    () => PostModel, (post) => post.comments,
    { onDelete: 'CASCADE' },
  )
  post: PostModel;

  @Column()
  @IsString({ message: stringValidationMessage })
  @IsNotEmpty({ message: notEmptyValidationMessage })
  content: string;

  @Column({ default: 0 }) // 데이터베이스 레벨의 기본값 설정 (데이터베이스 삽입 시 적용됨)
  @IsNumber({}, { message: numberValidationMessage })
  likeCount: number = 0; // 애플리케이션 레벨의 기본값 설정
}
