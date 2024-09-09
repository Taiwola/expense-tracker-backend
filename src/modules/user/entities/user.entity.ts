import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';


export enum UserRoles {
    ADMIN = 'Admin',
    USER = 'User',
  }
@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({
        type: "text",
        unique: true
    })
    email: string;

    @Column({type: "text", nullable: true})
    image: string

    @Column({nullable: true,type: "varchar" })
    password: string;

    @Column({nullable: true, type: "text"})
    refreshToken: string

    @Column({
        type: 'enum',
        enum: UserRoles,
        default: UserRoles.USER,
      })
      roles: UserRoles;

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
}
