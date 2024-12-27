import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TokenPrefix, TokenType } from './const/auth.const';
import { PasswordPipe } from './pipe/password.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login/email')
  postLoginEmail(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(
      rawToken,
      TokenPrefix.BASIC,
    );
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password', PasswordPipe) password: string,
  ) {
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    });
  }

  @Post('token/refresh')
  postRefreshToken(@Headers('Authorization') rawToken: string) {
    const token = this.authService.extractTokenFromHeader(
      rawToken,
      TokenPrefix.BEARER,
    );
    const accessToken = this.authService.rotateToken(token, TokenType.ACCESS);
    const refreshToken = this.authService.rotateToken(token, TokenType.REFRESH);
    return {
      accessToken,
      refreshToken,
    };
  }
}
