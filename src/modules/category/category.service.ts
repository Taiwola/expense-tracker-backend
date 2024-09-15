import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    private readonly userService: UserService
  ) {}

  // Create a new category
  async create(req: Request, createCategoryDto: CreateCategoryDto) {
    const userId = req.user.id;

    // Find user by ID
    const userExist = await this.userService.findOne(userId);
    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Attach user to the category DTO
    createCategoryDto.user = userExist;

    const category = this.categoryRepository.create({
      ...createCategoryDto,
    });

    return await this.categoryRepository.save(category);
  }

  // Get all categories for a user
  async findAll(req: Request) {
    const userId = req.user.id;

    // Find user by ID
    const userExist = await this.userService.findOne(userId);
    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Find all categories for the user
    const categories = await this.categoryRepository.find({
      relations: ['user'],
    });

    return categories;
  }

  // Get a single category by its ID
  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["user"]
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  // Update a category
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.categoryRepository.update(id, { ...updateCategoryDto });
      return await this.findOne(id);  // Return the updated category
    } catch (error) {
      console.error(error);
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a category
  async remove(id: string) {
    const category = await this.findOne(id);
    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return await this.categoryRepository.remove(category);
  }
}
