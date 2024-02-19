import { IsEmail, IsString } from "class-validator";

export class ResetPasswordDto {
    @IsEmail()
    @IsString()
    email: string;
    @IsString()
    newPassword: string;
    @IsString()
    key: string;
}