import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import {Request} from "express";
import { Income } from './entities/income.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { BudgetService } from '../budget/budget.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IncomeService {

  constructor(
    @InjectRepository(Income) 
    private readonly incomeRepository: Repository<Income>,
    private readonly userService: UserService,
    private readonly budgetService: BudgetService
  ) {}


  async create(req: Request, createIncomeDto: CreateIncomeDto) {
    try {
      const userId = req.user.id;

    // find user 
    const user = await this.userService.findOne(userId);

    if (!user) throw new HttpException('User does not exist', HttpStatus.INTERNAL_SERVER_ERROR);

    const budgetId = createIncomeDto.budgetId;
    // find budget
    const budget = await this.budgetService.findOne(budgetId);
    if (!budget) throw new HttpException("Budget does not exist", HttpStatus.NOT_FOUND);

    const options = {
      ...createIncomeDto,
      user: user,
      budget: budget
    }

    const income = this.incomeRepository.create({
      ...options
    });
    return await this.incomeRepository.save(income);
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async findAll(userId?:string, month?:string, year?:string) {
    const where: any = {};
  
    // Add year to the filter if it's provided
    if (year) {
      where.year = parseInt(year, 10);
    }

    // Add month to the filter if it's provided
    if (month) {
      where.month = month.toLowerCase();
    }

    // Add user filtering if userId is provided
    if (userId) {
      const userExist = await this.userService.findOne(userId);
      if (!userExist) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      // Add nested user filtering using relations
      where.user = { id: userId };
    }
    const incomes = await this.incomeRepository.find({
      where,
      relations: ['user', 'budget'],
    });
    return incomes;
  }

  async findOne(id: string) {
    const income = await this.incomeRepository.findOne({
      where: {id: id},
      relations: ['user', 'budget']
    });
    if (!income) throw new HttpException("Income does not exist", HttpStatus.NOT_FOUND);
    return income
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto) {
    const income = await this.findOne(id);
    if (!income) throw new HttpException("Income does not exist", HttpStatus.NOT_FOUND);
    try {
      const updateIncome = await this.incomeRepository.update(id, {
        ...updateIncomeDto
      });

      if (updateIncome.affected >= 1) {
        const income = await this.findOne(id);
        return income;
      } else {
        throw new HttpException("Income could not be updated, try again", HttpStatus.NOT_MODIFIED);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async remove(id: string) {
    const income = await this.findOne(id);
    if (!income) throw new HttpException("Income does not exist", HttpStatus.NOT_FOUND);
    try {
      const removeIncome = await this.incomeRepository.remove(income);
      return removeIncome;
    } catch (error) {
      console.error(error);
      throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR)
    }

  }
}
