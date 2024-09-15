import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { UserModule } from '../user/user.module';
import { BudgetModule } from '../budget/budget.module';
import { IncomeModule } from '../income/income.module';
import { ExpenseModule } from '../expense/expense.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [UserModule, BudgetModule, IncomeModule, ExpenseModule, CategoryModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
