import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}


  async findById(id: string) {
    const user =  await this.userRepository.findOne({
      where: {id: id},
      relations: ['categories', 'budgets', 'incomes', 'expenses', 'categories.expenses', 'budgets.expenses', 'expenses.category'],
      select: {password: false}
    });


    return user
  }

  async findByEmail(email: string) {
    const user =  await this.userRepository.findOne({
      where: {email: email},
      relations: ['categories', 'budgets', 'incomes', 'expenses'],
      select: {password: false}
    });

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    
    if (existingUser) {
      throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
    }
    const user = this.userRepository.create({
      ...createUserDto,
    })
    return await this.userRepository.save(user);
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['categories', 'budgets', 'incomes', 'expenses'],
      select: {password: false}
    });

    const removePassword = users.map((user) => {
      const {password, ...rest} = user;
      return rest
    })

   return removePassword;
  }

  async findOne(id: string) {
    const user = await this.findById(id);

    if (!user) throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {id: id}
    });

    if (!user) throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);

    try {
      const updateUser = await this.userRepository.update({id:id}, {...updateUserDto});
      if (updateUser.affected >= 1) {
        const updatedUser = await this.findById(id);
       return updatedUser
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
         'Internal server error'
      , HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async  updatePassword(id: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {id: id}
      });
      if (!user) throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);
      try {
        const updateUser = await this.userRepository.update({id:id}, {password: password});
        if (updateUser.affected >= 1) {
          return true}
      } catch(error) {
        console.log(error);
      }
  }

  async remove(id: string) {
    const user = await this.findById(id);

    if (!user) throw new HttpException("User does not exist", HttpStatus.NOT_FOUND);

    try {
      const deleteUser = await this.userRepository.delete(id);
      if (deleteUser.affected >= 1) {
        return {
          message: "Request was successfull",
          status: true
        }
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
