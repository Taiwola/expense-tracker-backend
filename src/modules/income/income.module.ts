import { Module } from '@nestjs/common';
import { IncomeService } from './income.service';
import { IncomeController } from './income.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';
import { UserModule } from '../user/user.module';
import { BudgetModule } from '../budget/budget.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Income]),
    UserModule,
    BudgetModule
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService]
})
export class IncomeModule {}
