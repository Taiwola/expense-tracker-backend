import { Expose, Type } from 'class-transformer';
import { Budget } from 'src/modules/budget/entities/budget.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Income } from 'src/modules/income/entities/income.entity';
import { User, UserRoles } from '../entities/user.entity';
import { Expense } from 'src/modules/expense/entities/expense.entity';

export class UserResponseDto implements User {

  password: string;

  @Expose()
  roles: UserRoles;
  
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  image: string;

  @Expose()
  refreshToken: string;

  @Expose()
  @Type(() => Date) 
  createdAt: Date;

  @Expose()
  @Type(() => Date) 
  updatedAt: Date;

  @Expose()
  @Type(() => Budget) // Transform budgets array
  budgets: Budget[];
  
  @Expose()
  @Type(() => Income) // Transform incomes array
  incomes: Income[];

  @Expose()
  @Type(() => Category) // Transform categories array
  categories: Category[];

  @Expose()
  @Type(() => Expense)
  expenses: Expense[];
}
