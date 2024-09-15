import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Budget } from 'src/modules/budget/entities/budget.entity';

@Entity()
export class Income {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type:"int", nullable: true})
  amount: number;

  @Column({type: "varchar"})
  month: string;

  @Column('int')
  year: number;

  @Column({type: "text"})
  source: string

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

  @ManyToOne(() => User, (user) => user.incomes)
  user: User;

  @ManyToOne(() => Budget, (budget) => budget.incomes)
   budget: Budget;
}
