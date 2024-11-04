import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class ForgottenPasswordDto {
    @IsNotEmpty()
    @IsEmail({},{ message: 'Invalid email format' })
    email: string;
}
