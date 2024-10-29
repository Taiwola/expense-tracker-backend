import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/userResponse.dto';

@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  async create(
    @Body() createBudgetDto: CreateBudgetDto,
    @Req() req: Request
  ) {
    const budget = await this.budgetService.create(req, createBudgetDto);
    const transform = {
      ...budget.user,
      fullName: `${budget.user.firstName} ${budget.user.lastName}`
    };

    const transformUser = plainToInstance(UserResponseDto, transform, { excludeExtraneousValues: true });
    const transformBudget = {
      ...budget,
      user: transformUser
    };
    return {
      message: "Budget created successfully",
      data: transformBudget,
      status: true
    };
  }

  @Get()
  async findAll(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('userId') userId: string,
  ) {
    const budgets = await this.budgetService.findAll(year, month, userId);

    // Transform users in each budget
    const transformedBudgets = budgets.map(budget => {
      const transform = {
        ...budget.user,
        fullName: `${budget.user.firstName} ${budget.user.lastName}`
      };

  
      const transformUser = plainToInstance(UserResponseDto, transform, { excludeExtraneousValues: true });

      return {
        ...budget,
        user: transformUser
      };
    });

    return {
      message: "Request was successful",
      data: transformedBudgets,
      status: true
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const budget = await this.budgetService.findOne(id);

    // Transform the user in the budget
    const transform = {
      ...budget.user,
      fullName: `${budget.user.firstName} ${budget.user.lastName}`

    };

    const transformUser = plainToInstance(UserResponseDto, transform, { excludeExtraneousValues: true });
    const transformBudget = {
      ...budget,
      user: transformUser
    };

    return {
      message: "Request was successful",
      data: transformBudget,
      status: true
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.budgetService.update(id, updateBudgetDto);

    // Transform the user in the budget
    const transform = {
      ...budget.user,
      fullName: `${budget.user.firstName} ${budget.user.lastName}`
    };

    const transformUser = plainToInstance(UserResponseDto, transform, { excludeExtraneousValues: true });
    const transformBudget = {
      ...budget,
      user: transformUser
    };

    return {
      message: "Request was successful",
      data: transformBudget,
      status: true
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const budget = await this.budgetService.remove(id);

    return {
      message: "Budget deleted successfully",
      data: budget,
      status: true
    };
  }
}
