import { IsNumber, IsInt, IsString, Min, Max, IsOptional, IsNotEmpty } from 'class-validator';
import { User } from "src/modules/user/entities/user.entity";

export class CreateBudgetDto {
  
  @IsNumber()
  @Min(0, { message: 'Amount must be a positive number' })
  amount: number;

  @IsInt({ message: 'Year must be an integer' })
  @Min(1900, { message: 'Year must not be before 1900' })
  @Max(new Date().getFullYear() + 10, { message: 'Year must not be more than 10 years in the future' })
  year: number;

  @IsString({ message: 'Month must be a valid string' })
  @IsNotEmpty()
  month: string;

  @IsOptional() // User is optional
  user?: User;
}
