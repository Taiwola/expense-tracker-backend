import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import {Request} from "express";
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interface/auth.interface';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector
    ) {}

  async canActivate(
    context: ExecutionContext,
  ) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true;
      }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new HttpException("Token is required", HttpStatus.UNAUTHORIZED);

    try {
        // verify the token
        const verifyToken = await this.jwtService.verifyAsync(token,
            {secret: process.env.JWT_SECRET as string}
        )
        if (!verifyToken) {
            throw new HttpException(
              'Invalid token or token has expired',
              HttpStatus.BAD_GATEWAY,
            );
          }

          const payload = this.jwtService.decode(token) as JwtPayload;
          request.user = payload;
          return true
    } catch (error) {
        console.error("Auth Guard Error: ", error);
        throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }





  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : false;
  }
}