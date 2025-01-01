import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { POSTS_FOLDER_RELATIVE_PATH } from "../const/path.const";
import { join } from "path";
import { PostModel as PostModel } from "src/posts/entity/posts.entity";
import { BaseModel } from "./base.entity";

export enum ImageModelType {
  POST = 'POST',
  PROFILE = 'PROFILE',
}

@Entity()
export class ImageModel extends BaseModel {
  // 프론트엔드에서 이미지 순서 지정 가능
  @Column({ default: 0 })
  @IsInt()
  @IsOptional()
  order: number;

  @Column({ enum: ImageModelType })
  @IsEnum(ImageModelType)
  type: ImageModelType;

  @Column()
  @IsString()
  @Transform(({ value, obj }) => {
    // obj : ImageModel
    if (obj.type === ImageModelType.POST) {
      return join(`/${POSTS_FOLDER_RELATIVE_PATH}`, value);
    }
    return value;
  })
  path: string;

  @ManyToOne(() => PostModel, (post) => post.images, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  post?: PostModel;
}
