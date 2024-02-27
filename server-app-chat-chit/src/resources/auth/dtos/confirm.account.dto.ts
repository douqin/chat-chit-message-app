import { Type } from "class-transformer";
import { IsEmail, IsNumber } from "class-validator";

export class ConfirmAccountDTO{
    @IsNumber()
    @Type(() => Number)
    otp : number;
    @IsEmail()
    email: string;
}