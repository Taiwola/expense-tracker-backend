import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BudgetService } from '../budget/budget.service';
import { CategoryService } from '../category/category.service';
import { IncomeService } from '../income/income.service';
import { ExpenseService } from '../expense/expense.service';
import { Request } from 'express';
import { User } from '../user/entities/user.entity';
import { createWriteStream } from 'fs';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { randomUUID } from 'crypto';



(pdfmake as any).vfs = pdfFonts.pdfMake.vfs; // Set the virtual file system for fonts
// Define a custom type for document definitions
type DocumentDefinition = {
  content: any[];
  styles?: { [key: string]: any };
};

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

  
  async  generatePDFReport(req: Request) {
    const userId = req.user.id;
    const user = await this.userService.findOne(userId);

    if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Define the document content using pdfmake
    const docDefinition: DocumentDefinition  = {
        content: [
            { text: 'Financial Report', style: 'header' },

            { text: 'Budgets', style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: [
                        ['Year', 'Month', 'Amount'],
                        ...user.budgets.map(budget => [budget.year.toString(), budget.month, budget.amount.toString()])
                    ]
                },
                layout: 'lightHorizontalLines'
            },

            { text: 'Expenses', style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        ['Category', 'Amount'],
                        ...user.expenses.map(expense => [expense.category.name, expense.amount.toString()])
                    ]
                },
                layout: 'lightHorizontalLines'
            },

            { text: 'Incomes', style: 'subheader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        ['Source', 'Amount'],
                        ...user.incomes.map(income => [income.source, income.amount.toString()])
                    ]
                },
                layout: 'lightHorizontalLines'
            }
        ],
        styles: {
            header: {
                fontSize: 20,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 18,
                margin: [0, 20, 0, 10]
            }
        }
    };

    // Create PDF
    const pdfDoc = pdfmake.createPdf(docDefinition);
    const pdfBytes = await new Promise<Buffer>((resolve, reject) => {
        pdfDoc.getBuffer((buffer) => {
            resolve(buffer);
        });
    });

    const randomUniquecode = randomUUID();
    const filePath = `reports/user_${userId}_report_${randomUniquecode}.pdf`;

    createWriteStream(filePath).write(pdfBytes);

    return { message: 'PDF report generated successfully', filePath };
}
  

}