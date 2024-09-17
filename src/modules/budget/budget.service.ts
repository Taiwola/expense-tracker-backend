import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class BudgetService {

  constructor(
    @InjectRepository(Budget) private readonly budgetRepository: Repository<Budget>,
    private readonly userService: UserService
  ) {}

  async create(req: Request, createBudgetDto: CreateBudgetDto) {
    try {
      const userId = req.user.id;
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      createBudgetDto.user = user;
      const budget = this.budgetRepository.create(createBudgetDto);
      return await this.budgetRepository.save(budget);  // Save to database
    } catch (error) {
      console.error(error);  // Log the error
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(year?: string, month?: string) {
    try {
      const where: any = {};
  
      // Add year to the filter if it's provided
      if (year) {
        where.year = parseInt(year, 10);
      }
  
      // Add month to the filter if it's provided
      if (month) {
        where.month = month.toLowerCase();
      }
  
      // Fetch budgets with optional filtering based on year and month
      const budgets = await this.budgetRepository.find({
        where,
        relations: ['user', 'incomes', 'expenses']
      });
  
      return budgets;
    } catch (error) {
      console.error(error);  // Log the error
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  

  async findOne(id: string) {
    try {
      const budget = await this.budgetRepository.findOne({
        where: { id: id },
        relations: ['user', 'incomes', 'expenses']
      });

      if (!budget) throw new HttpException('Budget does not exist', HttpStatus.NOT_FOUND);

      return budget;
    } catch (error) {
      console.error(error);  // Log the error
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    try {
      const budget = await this.findOne(id);
      if (!budget) throw new HttpException('Budget does not exist', HttpStatus.NOT_FOUND);

      const updateResult = await this.budgetRepository.update(id, updateBudgetDto);

      if (updateResult.affected === 0) {
        throw new HttpException('No budget updated', HttpStatus.BAD_REQUEST);
      }

      return await this.findOne(id);  // Return updated budget
    } catch (error) {
      console.error(error);  // Log the error
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
      const budget = await this.findOne(id);
      if (!budget) throw new HttpException('Budget does not exist', HttpStatus.NOT_FOUND);

      return await this.budgetRepository.remove(budget);
    } catch (error) {
      console.error(error);  // Log the error
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
