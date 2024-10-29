import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateAuthDto } from './dto/createAuth.dto';
import * as bcrypt from "bcryptjs";
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../user/dto/userResponse.dto';
import { SignInDto } from './dto/sign-in.dto';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
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

    async login(signinDto: SignInDto) {
        const user = await this.userService.findByEmail(signinDto.email);
        if (!user) throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    
        const isValidPassword = await bcrypt.compare(signinDto.password, user.password);
        if (!isValidPassword) throw new HttpException("Invalid password", HttpStatus.UNAUTHORIZED);
    
        const payload = { id: user.id, email: user.email };
        
        let refreshToken: string;
    
        // Check if the user has an existing refresh token and if it's valid
        if (user.refreshToken) {
            const refresh = await this.jwtService.verifyAsync(user.refreshToken).catch(() => null);  // handle invalid token
            if (!refresh) {
                // Generate a new refresh token only if the existing one is invalid
                refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
                
                // Update the user's refresh token in the database
                await this.userService.update(user.id, { refreshToken });
            } else {
                // Use the existing valid refresh token
                refreshToken = user.refreshToken;
            }
        } else {
            // Generate a new refresh token if no refresh token exists
            refreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' });
            
            // Update the user's refresh token in the database
            await this.userService.update(user.id, { refreshToken });
        }
    
        const token = await this.jwtService.signAsync(payload, { expiresIn: '1d' });
    
        // Add fullName field to the user object
        const transformedUser = {
            ...user, // No need to fetch the updated user again since we are not changing any other user details
            fullName: `${user.firstName} ${user.lastName}`
        };
    
        const transformed = plainToInstance(UserResponseDto, transformedUser, { excludeExtraneousValues: true });
    
        // Return the user and tokens
        return {
            message: "Request was successful",
            data: transformed,
            token: token,
            refreshToken: refreshToken,
            status: true
        };
    }
    
    
}
