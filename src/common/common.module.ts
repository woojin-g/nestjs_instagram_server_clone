import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { extname } from 'path';
import { TEMP_FOLDER_ABSOLUTE_PATH } from './const/path.const';
import { v4 as uuid } from 'uuid';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.register({
      // 파일 업로드 제한
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB
      },
      // 파일 업로드 필터
      //  - cb: (error: Error | null, acceptFile: boolean) => void
      //  - acceptFile : 파일 업로드 허용 여부
      fileFilter: (req, file, cb) => {
        // 파일 확장자 확인
        const ext = extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return cb(new BadRequestException('jpg, jpeg, png 파일만 업로드 가능합니다.'), false);
        }
        cb(null, true);
      },
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          // public/temp 폴더에 이미지 파일 임시 저장
          cb(null, TEMP_FOLDER_ABSOLUTE_PATH);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuid()}${ext}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule { }
