import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { typeormConfigAsync } from 'config/typeOrmConfig';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
