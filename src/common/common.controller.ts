import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('common')
export class CommonController {
  constructor(
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('image')
  @UseGuards(AccessTokenGuard)
  // MulterModule.register 함수를 통해 설정한 처리들을 수행하도록 하기 위함
  // 해당 처리가 끝난 뒤 Controller 함수가 실행된다.
  @UseInterceptors(FileInterceptor('image'))
  postImage(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename,
    };
  }
}
