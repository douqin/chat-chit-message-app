import { Type } from "class-transformer";
import Gender from "../enums/gender.enum";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, isDate, isEnum, isNotEmpty } from "class-validator";

export class RegisterAccountDTO {
  @Length(4, 20)
  firstname: string;
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;
  @IsPhoneNumber('VN')
  @IsNotEmpty()
  phone: string;
  @IsOptional()
  address: string;
  @IsString()
  @IsNotEmpty()
  lastname: string;
  @IsNotEmpty()
  @Type(() => Number)
  @IsEnum(Gender)
  gender: Gender;
  @Type(() => Date)
  @IsDate()
  birthday: Date;
}