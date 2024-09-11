import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {Request} from "express";
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/userResponse.dto';
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: Request 
) {
    const category = await this.categoryService.create(req, createCategoryDto);
    const user = category.user;
    const transformUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }

    const transfromedUser = plainToInstance(UserResponseDto, transformUser, { excludeExtraneousValues: true });
    const transformedCategory = {
      ...category,
      user: transfromedUser
    }
    return {
      message: "Category created successfully",
      data: transformedCategory,
      status: true
    }
  }

  @Get()
  async findAll(
    @Req() req: Request
  ) {
    const categories = await this.categoryService.findAll(req);
    const transform = categories.map((category) => {
      const transfomUser = {
        ...category.user,
        fullName: `${category.user.firstName} ${category.user.lastName}`
      }

      const transformedUser = plainToInstance(UserResponseDto, transfomUser, {excludeExtraneousValues: true});
      return {
        ...category,
        user: transformedUser
      }
    })
    return {
      message: "Request was successfull",
      data: transform,
      status: true
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const category = await this.categoryService.findOne(id);
    const user = category.user;
    const transformUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }

    const transfromedUser = plainToInstance(UserResponseDto, transformUser, { excludeExtraneousValues: true });
    const transformedCategory = {
      ...category,
      user: transfromedUser
    }
    return {
      message: "Request was successfull",
      data: transformedCategory,
      status: true
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryService.update(id, updateCategoryDto);
    const user = category.user;
    const transformUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }

    const transfromedUser = plainToInstance(UserResponseDto, transformUser, { excludeExtraneousValues: true });
    const transformedCategory = {
      ...category,
      user: transfromedUser
    }
    return {
      message: "Request was successfull",
      data: transformedCategory,
      status: true
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const category = await this.categoryService.remove(id);
    return {
      message: "Category deleted",
      data: category,
      status: true
    }
  }
}
