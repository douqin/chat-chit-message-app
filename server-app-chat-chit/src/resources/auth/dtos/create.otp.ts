import { OTPTarget } from "@/services/mail"
import { IsEmail, IsEnum, IsNumber, IsString } from "class-validator"

export class CreateOtpDTO{
    @IsString()
    @IsEmail()
    email : string
    @IsEnum(OTPTarget)
    target : OTPTarget
}