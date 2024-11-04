import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/createAuth.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Public } from './decorator/public.decorator';
import { ForgottenPasswordDto } from './dto/fogottenPassword.dto';
import { ResetPasswordDto } from './dto/resetPasswordDto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createAuthDto:CreateAuthDto
  ) {
    return this.authService.register(createAuthDto)
  }

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() siginDto:SignInDto
  ) {
    return this.authService.login(siginDto)
  }

  @Post('forgot-password')
  async forgotPassword(
    @Body() data: ForgottenPasswordDto
  ) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
async resetPassword(@Body() resetPassword: ResetPasswordDto) {
  return await this.authService.resetPassword(resetPassword);
}

}
