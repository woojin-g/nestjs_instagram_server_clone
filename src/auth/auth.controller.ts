import { Body, Controller, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenPrefix, TokenType } from './const/auth.const';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-token.guard';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  postLoginEmail(
    @Headers('authorization') rawToken: string,
  ) {
    const token = this.authService.extractTokenFromHeader(rawToken, TokenPrefix.BASIC);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(@Body() body: RegisterUserDto) {
    return this.authService.registerWithEmail(body);
  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
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
