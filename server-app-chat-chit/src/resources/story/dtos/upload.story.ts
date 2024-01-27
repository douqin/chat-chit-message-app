import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Visibility } from "../enums/visibility";

export class OptionUploadStoryDTO {

    @IsNotEmpty()
    @IsEnum(Visibility)
    @Transform(({ value }) => JSON.parse(value))
    visibility: Visibility
}