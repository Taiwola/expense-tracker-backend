import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateAuthDto } from './dto/createAuth.dto';
import * as bcrypt from "bcryptjs";
import { UpdateAuthDto } from './dto/updateAuth.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/userResponse.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService
    ) {}


    async register(createAuthDto: CreateAuthDto) {
        try {
            const user = await this.userService.findByEmail(createAuthDto.email);
            if (user) throw new HttpException("User already exist", HttpStatus.BAD_REQUEST);
    
            // hash the password
            const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    
            // add the hashed password to the request body
            const userToCreate = { ...createAuthDto, password: hashedPassword };
            const createdUser = await this.userService.create(userToCreate);
            const transformUser = {
                ...createdUser,
                fullName: `${createdUser.firstName} ${createdUser.lastName}`,
            }

            // Return the transformed instance
    const transform = plainToInstance(UserResponseDto, transformUser, { excludeExtraneousValues: true });
            return {
                message: "Request was successfull",
                data: transform,
                status: true
            };
        } catch (error) {
            console.error(error);
            throw new HttpException("Internal server error", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(updateAuthDto: UpdateAuthDto) {
        const user = await this.userService.findByEmail(updateAuthDto.email);
        if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
        const isValidPassword = await bcrypt.compare(updateAuthDto.password, user.password);
        if (!isValidPassword) throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);
         
        return user;
    }
}
