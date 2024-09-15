import { Controller, Get, Post, Body, Patch, Param, Delete, Req, ParseUUIDPipe } from '@nestjs/common';
import { IncomeService } from './income.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import {Request} from "express";

@Controller('income')
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async create(
    @Body() createIncomeDto: CreateIncomeDto,
    @Req() req: Request
  ) {
    const income = await this.incomeService.create(req, createIncomeDto);
    return {
      message: "Request was successfull",
      data: income,
      status: true
    }
  }

  @Get()
  async findAll() {
    const incomes = await this.incomeService.findAll();
    return {
      message: "Request was successfull",
      data: incomes,
      status: true
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const income = await this.incomeService.findOne(id);
    return {
      message: "Request was successfull",
      data: income,
      status: true
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateIncomeDto: UpdateIncomeDto) {
    const income = await this.incomeService.update(id, updateIncomeDto);
    return {
      message: "Request was successfull",
      data: income,
      status: true
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const income = await this.incomeService.remove(id);
    return {
      message: "Income successfully removed",
      data: income,
      status: true
    }
  }
}
