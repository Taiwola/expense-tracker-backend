import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/userResponse.dto'; // Create this DTO for response
import { Roles } from '../auth/decorator/roles.decorator';
import { UserRoles } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles(UserRoles.ADMIN)
  @Get()
  async findAll() {
    const users = await this.userService.findAll();
    
    // Transform user data and add fullName
    const transformedUsers = users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    }));
    
    // Return the transformed instance
    const transform = plainToInstance(UserResponseDto, transformedUsers, { excludeExtraneousValues: true });

    return {
      message: "Request was successfull",
      data: transform,
      status: true
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    
    // Transform user data and add fullName
    const transformedUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    };
    
    const transform = plainToInstance(UserResponseDto, transformedUser, { excludeExtraneousValues: true });

    return {
      message: "Request was successfull",
      data: transform,
      status: true
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);

    // Return the transformed instance of the updated user
    const transformedUser = {
      ...updatedUser,
      fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
    };
    
    const transform = plainToInstance(UserResponseDto, transformedUser, { excludeExtraneousValues: true });
    return {
      message: "Request was succussfull",
      data: transform,
      status: true
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
