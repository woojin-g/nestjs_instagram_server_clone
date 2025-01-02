import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryRunner, Repository } from "typeorm";
import { ImageModel } from "src/common/entity/image.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { basename } from "path";
import { CreatePostImageDto } from "./dto/create-image.dto";
import { POSTS_FOLDER_ABSOLUTE_PATH, TEMP_FOLDER_ABSOLUTE_PATH } from "src/common/const/path.const";
import { join } from "path";
import { promises } from "fs";
import { ErrorCode } from "src/common/const/error.const";

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImageModel)
    private readonly imagesRepository: Repository<ImageModel>,
  ) { }

  getRepository(qr?: QueryRunner): Repository<ImageModel> {
    // 동일한 트랜잭션 내에서 데이터베이스 작업을 수행하기 위해서는 QueryRunner의 Repository를 사용해야 한다.
    // 그 외의 일반적인 경우에는 기본 Repository를 사용한다.
    return qr ? qr.manager.getRepository(ImageModel) : this.imagesRepository;
  }

  /**
 * /public/temp 폴더의 이미지 파일을 public/posts 폴더로 이동
 * @param dto 
 * @returns 
 */
  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner): Promise<ImageModel> {
    const repository = this.getRepository(qr);
    const tempFilePath = join(TEMP_FOLDER_ABSOLUTE_PATH, dto.path);
    try {
      await promises.access(tempFilePath);
    } catch (error) {
      throw new NotFoundException('존재하지 않는 이미지입니다.', ErrorCode.NOT_FOUND_IMAGE);
    }

    const fileName = basename(tempFilePath);
    const filePath = join(POSTS_FOLDER_ABSOLUTE_PATH, fileName);

    const createdImage = await repository.save(dto);
    await promises.rename(tempFilePath, filePath);
    return createdImage;
  }
}
