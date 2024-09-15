import { Budget } from "src/modules/budget/entities/budget.entity";
import { Category } from "src/modules/category/entities/category.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'int', nullable: true})
    amount: number;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Budget, (budget) => budget.expenses)
    budget: Budget;

    @ManyToOne(() => Category, (category)=> category.expenses)
    category: Category;

    @ManyToOne(() => User, (user) => user.expenses)
    user: User;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
      })
      createdAt: Date;
    
      @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
      })
      updatedAt: Date;
}
