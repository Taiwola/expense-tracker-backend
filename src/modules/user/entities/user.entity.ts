import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
    password: string
}
