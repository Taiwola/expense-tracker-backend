import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as compression from 'compression';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { ExcludeNullInterceptor } from './modules/auth/interceptors/excludeNull.interceptors';
import { UserReq } from './modules/auth/interface/auth.interface';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserReq;
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ExcludeNullInterceptor());
  app.enableCors({
    origin: "*"
  });
  app.use(compression());
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable automatic transformation
      whitelist: true, // Strips properties that are not part of the DTO
      forbidNonWhitelisted: true, // Throws an error if any non-whitelisted properties are present
    }),
  );
  await app.listen(3000);
}
bootstrap();
