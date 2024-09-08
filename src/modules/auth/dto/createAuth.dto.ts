import { IsString, IsEmail, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 100)
  password: string;
}
