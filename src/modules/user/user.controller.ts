import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
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

  @Roles(UserRoles.USER)
  @Get()
  async findAll() {
    const usersArr = await this.userService.findAll();
  
    // Transform user data and add fullName, budgets, incomes, and expenses
    const users = usersArr.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      budgets: user.budgets || [],  
      incomes: user.incomes || [], 
      expenses: user.expenses || [] 
    }));
  
    return {
      message: "Request was successful",
      data: users,
      status: true
    };
  }
  

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.findOne(id);
    
    // Transform user data and add fullName
    const transformedUser = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      budgets: user.budgets || [], 
      incomes: user.incomes || [], 
      expenses: user.expenses || [] 
    };

    const {password, ...rest} = transformedUser;
    

    return {
      message: "Request was successfull",
      data: rest,
      status: true
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
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
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.remove(id);
  }
}
