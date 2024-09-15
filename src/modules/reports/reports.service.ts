import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { UserService } from '../user/user.service';
import { BudgetService } from '../budget/budget.service';
import { CategoryService } from '../category/category.service';
import { IncomeService } from '../income/income.service';
import { ExpenseService } from '../expense/expense.service';
import {Request} from "express";

@Injectable()
export class ReportsService {

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService
  ) {}

  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  async getAllTotal(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);
    console.log(user);

    const budgets = user.budgets;
 
    const budgetsAmount = budgets.map((budget) => {
      return budget.amount;
    });

    const budgetTotal = budgetsAmount.reduce((a,b) => a + b,0);
 

    const incomes = user.incomes;

    const incomeAmount = incomes.map((income) => income.amount);
    const incomeTotal = incomeAmount.reduce((a,b) => a + b,0);
   

    const expenses = user.expenses;
 
    const expenseAmount = expenses.map((expense) => expense.amount);
    const expenseTotal = expenseAmount.reduce((a,b) => a + b, 0);
    console.log(expenseTotal);

    return {
      totalExpense: expenseTotal,
      totalIncome: incomeTotal,
      totalBudget: budgetTotal
    }
  }

  findAll() {
    return `This action returns all reports`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
