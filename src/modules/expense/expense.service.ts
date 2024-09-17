import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { BudgetService } from '../budget/budget.service';
import { CategoryService } from '../category/category.service';
import {Request} from "express";

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense) private readonly expenseRepository: Repository<Expense>,
    private readonly userService: UserService,
    private readonly budgetService: BudgetService,
    private readonly categoryService: CategoryService 
  ) {}
  async create(req: Request, createExpenseDto: CreateExpenseDto) {
    try {
      const userId = req.user.id;
      const user = await this.userService.findOne(userId);
      if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      const budget = await this.budgetService.findOne(createExpenseDto.budgetId);
      if (!budget) throw new HttpException("Budget not found", HttpStatus.NOT_FOUND);
      const category = await this.categoryService.findOne(createExpenseDto.categoryId);
      if (!category) throw new HttpException("Category not found", HttpStatus.NOT_FOUND);
      const expense = this.expenseRepository.create({
        ...createExpenseDto,
        budget: budget,
        category: category,
        user: user
      });
      return await this.expenseRepository.save(expense);
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
   const expenses = await this.expenseRepository.find({
    relations: ['budget', 'category', 'user']
   });
   return expenses
  }

  async findOne(id: string) {
    const expense = await this.expenseRepository.findOne({
      where: {id: id},
      relations: ['budget', 'category', 'user']
    });
    return expense
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
   

    try {
      const expense = await this.findOne(id);
      if (!expense) throw new HttpException("Expense not found", HttpStatus.NOT_FOUND);
  
      const updateExpense = await this.expenseRepository.update(id, {
        ...updateExpenseDto
      });
  
      if (updateExpense.affected >= 1) {
        return await this.expenseRepository.findOne({
          where: {id: id}
        });
      }
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    const expenses = await this.findOne(id);
    if (!expenses) throw new HttpException("Expense not found", HttpStatus.NOT_FOUND);
    const removeExpense = await this.expenseRepository.remove(expenses);
    return removeExpense;
  }
}
