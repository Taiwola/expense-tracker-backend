import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Unique, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Income } from 'src/modules/income/entities/income.entity';
import { Expense } from 'src/modules/expense/entities/expense.entity';

@Entity()
@Unique(['user','month', 'year']) // Ensures one budget entry per month and year for the user
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'int', nullable: true})
  amount: number;

  @Column({type: "text"})
  month: string;

  @Column({type: "numeric"})
  year: number;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
})
createdAt: Date;

@UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',  // Automatically update the timestamp on updates
})
updatedAt: Date;

  @ManyToOne(() => User, (user) => user.budgets)
  user: User;

  @OneToMany(() => Income, (income) => income.budget)
  incomes: Income[]
  
  @OneToMany(() => Expense, (expense) => expense.budget)
  expenses: Expense[] 
}
