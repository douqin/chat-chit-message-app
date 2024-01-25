import { IsPhoneNumber, IsString } from "class-validator";

export class ConfirmAccountDTO{
    @IsString()
    otp : string;
    @IsPhoneNumber('VN')
    phone : string;
}