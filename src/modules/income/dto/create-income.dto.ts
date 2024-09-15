
import {IsUUID, IsString, IsNotEmpty, IsNumber} from "class-validator";

export class CreateIncomeDto {
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    @IsString()
    month: string;

    @IsNumber()
    @IsNotEmpty()
    year: number;

    @IsNotEmpty()
    @IsString()
    source: string

    @IsUUID()
    budgetId: string;
}
