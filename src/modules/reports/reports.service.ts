import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BudgetService } from '../budget/budget.service';
import { CategoryService } from '../category/category.service';
import { IncomeService } from '../income/income.service';
import { ExpenseService } from '../expense/expense.service';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
import { createWriteStream } from 'fs';
import { PDFDocument, rgb } from 'pdf-lib';
import { randomUUID } from 'crypto';

@Injectable()
export class ReportsService {
  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private incomeService: IncomeService,
    private expenseService: ExpenseService
  ) {}

  // Helper function to calculate total for a given type (budgets, incomes, expenses)
  private async getTotal(user: User, type: 'budgets' | 'incomes' | 'expenses') {
    const data = user[type] || [];
    return data.reduce((total, item) => total + item.amount, 0);
  }

  // Retrieves total budgets, incomes, and expenses for a user
  async getAllTotal(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const budgetTotal = await this.getTotal(user, 'budgets');
    const incomeTotal = await this.getTotal(user, 'incomes');
    const expenseTotal = await this.getTotal(user, 'expenses');

    return {
      totalExpense: expenseTotal,
      totalIncome: incomeTotal,
      totalBudget: budgetTotal,
    };
  }

  // Calculates the percentage of expenses to budget for each category
  async getPercentageOfExpenseToBudgetByCategories(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const expenseTotal = await this.getTotal(user, 'expenses');

    const categoriesExp = user.categories.map((category) => {
      const totalCategoryExpense = category.expenses.reduce((total, expense) => total + expense.amount, 0);
      const percentage = (totalCategoryExpense / expenseTotal) * 100 || 0;

      return {
        name: category.name,
        expenses: category.expenses,
        percentage,
      };
    });

    return categoriesExp;
  }

  // Retrieves total expenses for a specific year and month
  async generateTotalForAmount(req: Request, year: number, month: string) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    const budgets = user.budgets;

    // Filter budgets for the specific year
    const budgetsForTheYear = budgets.filter(budget => budget.year === year);

    // Further filter budgets for the specific month (case-insensitive comparison)
    const budgetsForTheMonth = budgetsForTheYear.filter(budget => 
      budget.month.toLowerCase() === month.toLowerCase()
    );

    // If no budgets are found for the year and month, return an empty result
    if (budgetsForTheMonth.length === 0) {
      return { totalExpenses: 0, message: 'No expenses found for the specified year and month.'};
    }

    // Calculate total expenses for the month
    const totalExpensesForTheMonth = budgetsForTheMonth.reduce((total, budget) => {
      const totalExpenseForBudget = budget.expenses.reduce((expenseTotal, expense) => expenseTotal + expense.amount, 0);
      return total + totalExpenseForBudget;
    }, 0);

    return { totalExpenses: totalExpensesForTheMonth, budget: budgetsForTheMonth };
  }

  // Retrieves monthly trends for expenses and incomes
  async getMonthlyTrends(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const budgets = user.budgets || [];
    const expensesByMonth = new Map<string, number>();
    const incomesByMonth = new Map<string, number>();

    // Aggregate expenses by month
    budgets.forEach(budget => {
      if (budget.expenses) {
        budget.expenses.forEach(expense => {
          const month = expense.createdAt.toLocaleString('default', { month: 'long' }); // e.g., 'September'
          expensesByMonth.set(month, (expensesByMonth.get(month) || 0) + expense.amount);
        });
      }
    });

    // Aggregate incomes by month
    user.incomes.forEach(income => {
      const month = income.createdAt.toLocaleString('default', { month: 'long' }); // e.g., 'September'
      incomesByMonth.set(month, (incomesByMonth.get(month) || 0) + income.amount);
    });

    return {
      expensesByMonth: Array.from(expensesByMonth.entries()),
      incomesByMonth: Array.from(incomesByMonth.entries()),
    };
  }

  // Provides a breakdown of expenses by category
  async getCategoryWiseBreakdown(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const categoryBreakdown = user.categories.map(category => {
      const totalCategoryExpense = category.expenses.reduce((total, expense) => total + expense.amount, 0);

      return {
        category: category.name,
        totalExpenses: totalCategoryExpense,
      };
    });

    return categoryBreakdown;
  }

  // Provides annual budget planning, including total budget, total spent, and remaining budget
  async getAnnualBudgetPlanning(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const currentYear = new Date().getFullYear();
    const budgets = user.budgets.filter(budget => budget.year === currentYear);

    const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
    const totalSpent = budgets.reduce((total, budget) => total + budget.expenses.reduce((acc, expense) => acc + expense.amount, 0), 0);

    return {
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
    };
  }

  // Forecasts future expenses based on historical data
  async forecastExpenses(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const expenses = user.expenses || [];
    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = expense.createdAt.toLocaleString('default', { month: 'long' }); // e.g., 'September'
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const months = Object.keys(monthlyExpenses);
    const totalMonths = months.length;
    const averageMonthlyExpense = Object.values(monthlyExpenses).reduce((sum, value) => sum + value, 0) / totalMonths;

    return {
      averageMonthlyExpense,
      forecastedExpenses: averageMonthlyExpense * 12, // Example: simple annual forecast
    };
  }

  // Generates a custom report for a specified date range
  async generateCustomReport(req: Request, startDate: Date, endDate: Date) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const budgets = user.budgets || [];
    const expenses = user.expenses || [];
    const incomes = user.incomes || [];

    const filteredExpenses = expenses.filter(expense => expense.createdAt >= startDate && expense.createdAt <= endDate);
    const filteredIncomes = incomes.filter(income => income.createdAt >= startDate && income.createdAt <= endDate);

    const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    const totalIncomes = filteredIncomes.reduce((total, income) => total + income.amount, 0);

    return {
      totalExpenses,
      totalIncomes,
      netIncome: totalIncomes - totalExpenses,
    };
  }

  // Checks for budget alerts where spending has exceeded the budget
  async checkBudgetAlerts(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const budgets = user.budgets || [];
    const alerts = [];

    budgets.forEach(budget => {
      const totalSpent = budget.expenses.reduce((total, expense) => total + expense.amount, 0);

      if (totalSpent > budget.amount) {
        alerts.push({
          spent: totalSpent,
          budget: budget.amount,
          alert: 'Exceeded budget',
        });
      }
    });

    return alerts;
  }

  async generatePDFReport(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const fontSize = 12;

    // Define colors
    const headerColor = rgb(0.2, 0.5, 0.8); // Light blue
    const rowColor = rgb(0.9, 0.9, 0.9);    // Light gray
    const textColor = rgb(0, 0, 0);         // Black

    const drawTable = (data: { label: string, value: string }[], startY: number) => {
      let yPosition = startY;

      // Draw table header
      page.drawRectangle({ x: 50, y: yPosition, width: 500, height: 20, color: headerColor });
      page.drawText('Label', { x: 55, y: yPosition + 5, size: fontSize, color: textColor });
      page.drawText('Value', { x: 305, y: yPosition + 5, size: fontSize, color: textColor });
      yPosition -= 20;

      // Draw table rows
      data.forEach((row, index) => {
        page.drawRectangle({ x: 50, y: yPosition, width: 500, height: 20, color: index % 2 === 0 ? rowColor : rgb(1, 1, 1) });
        page.drawText(row.label, { x: 55, y: yPosition + 5, size: fontSize, color: textColor });
        page.drawText(row.value, { x: 305, y: yPosition + 5, size: fontSize, color: textColor });
        yPosition -= 20;
      });

      return yPosition;
    };

    let yPosition = height - 50;
    page.drawText('Financial Report', { x: 50, y: yPosition, size: 20, color: textColor });
    yPosition -= 50;

    const budgets = user.budgets || [];
    const expenses = user.expenses || [];
    const incomes = user.incomes || [];

    // Draw Budgets table
    yPosition = drawTable(budgets.map(budget => ({ label: 'Budget', value: `${budget.amount}`, year: `${budget.year}`, month: `${budget.month}`  })), yPosition);

    // Draw Expenses table
    yPosition -= 20;
    page.drawText('Expenses:', { x: 50, y: yPosition, size: fontSize, color: textColor });
    yPosition -= 20;
    yPosition = drawTable(expenses.map(expense => ({ label: expense.category.name, value: `${expense.amount}` })), yPosition);

    // Draw Incomes table
    yPosition -= 20;
    page.drawText('Incomes:', { x: 50, y: yPosition, size: fontSize, color: textColor });
    yPosition -= 20;
    yPosition = drawTable(incomes.map(income => ({ label: income.source, value: `${income.amount}` })), yPosition);

    const randomUniquecode = randomUUID();
    const pdfBytes = await doc.save();
    const filePath = `reports/user_${userId}_report_${randomUniquecode}.pdf`;

    createWriteStream(filePath).write(pdfBytes);

    return { message: 'PDF report generated successfully', filePath };
  }
}
