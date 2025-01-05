import { Body, Controller, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenPrefix, TokenType } from './const/auth.const';
import { BasicTokenGuard } from './guard/basic-token.rest-api.guard';
import { RefreshTokenRestApiGuard } from './guard/bearer-token.rest-api.guard';
import { RegisterUserDto } from './dto/register-user.dto';
import { IsPublic } from 'src/common/decorator/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login/email')
  @IsPublic() // 액세스 토큰 없이 접근 가능
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BASIC);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  @IsPublic() // 액세스 토큰 없이 접근 가능
  postRegisterEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('token/refresh')
  @IsPublic() // 액세스 토큰 없이 접근 가능
  @UseGuards(RefreshTokenRestApiGuard)
  async postRefreshToken(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(
      rawToken,
      TokenPrefix.BEARER,
    );
    const accessToken = await this.authService.rotateToken(token, TokenType.ACCESS);
    const refreshToken = await this.authService.rotateToken(token, TokenType.REFRESH);
    return {
      accessToken,
      refreshToken,
    };
  }
}
