import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class ConfirmAccount {
    @IsPhoneNumber('VN')
    phone: string;
    @IsString()
    @IsNotEmpty()
    otp: string;
}