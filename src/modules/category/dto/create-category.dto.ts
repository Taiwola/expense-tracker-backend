import { User } from "src/modules/user/entities/user.entity";
import {IsString, IsOptional, IsNotEmpty} from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    user?: User
}
