import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Optional } from '@nestjs/common';
import { UserRoles } from '../entities/user.entity';

export class CreateUserDto {
  
  @IsString({ message: 'First name must be a string' })
  @Length(2, 30, { message: 'First name must be between 2 and 30 characters' })
  firstName: string;

  @IsString({ message: 'Last name must be a string' })
  @Length(2, 30, { message: 'Last name must be between 2 and 30 characters' })
  lastName: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsOptional() // Optional field if the password is not mandatory
  @IsString({ message: 'Password must be a string' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  @Exclude({ toPlainOnly: true }) // Exclude the password when transforming to plain object
  password: string;

  @IsOptional() // Optional field
  @IsString({ message: 'Image must be a string (URL or path)' })
  image?: string;

  @IsOptional() // Optional field
  @IsString()
  roles?: UserRoles;

  @IsOptional()
  refreshToken?: string
}
