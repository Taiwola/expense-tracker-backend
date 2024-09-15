import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseUUIDPipe } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {Request} from "express";

@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(
    @Body() createExpenseDto: CreateExpenseDto,
    @Req() req: Request
  ) {
    const expense = await this.expenseService.create(req, createExpenseDto);
    return {
      message: "Expense created successfully",
      data: expense,
      status: true
    }
  }

  @Get()
  async findAll() {
   const expenses = await this.expenseService.findAll();
   return {
    message: "Request was successfull",
    data: expenses,
    status: true
   }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const expense = await this.expenseService.findOne(id);
    return {
      message: "Request was successfull",
      data: expense,
      status: true
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    const expense = await this.expenseService.update(id, updateExpenseDto);
    return {
      message: 'Expense was updated successfully',
      data: expense,
      status: true
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const expense = await this.expenseService.remove(id);
    return {
      message: "Expense was removed",
      data: expense,
      status: true
    }
  }
}
