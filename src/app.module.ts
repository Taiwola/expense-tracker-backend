import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import { typeormConfigAsync } from 'config/typeOrmConfig';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ExcludeNullInterceptor } from './modules/auth/interceptors/excludeNull.interceptors';
import { AuthGuard } from './modules/auth/guard/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from 'config/jwt.config';
import { RolesGuard } from './modules/auth/guard/roles.guard';
import { CategoryModule } from './modules/category/category.module';
import { BudgetModule } from './modules/budget/budget.module';
import { IncomeModule } from './modules/income/income.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { ReportsModule } from './modules/reports/reports.module';


@Module({
  imports: [
    TypeOrmModule.forRootAsync(typeormConfigAsync),
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    UserModule,
    AuthModule,
    JwtModule.registerAsync(jwtConfig),
    CategoryModule,
    BudgetModule,
    IncomeModule,
    ExpenseModule,
    ReportsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ExcludeNullInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
})
export class AppModule {}
