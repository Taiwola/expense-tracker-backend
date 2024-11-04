import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'config/jwt.config';
import { ServiceModule } from '../services/service.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync(jwtConfig),
    ServiceModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
