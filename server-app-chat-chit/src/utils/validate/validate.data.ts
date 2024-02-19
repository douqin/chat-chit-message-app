import { ClassConstructor, ClassTransformOptions, plainToInstance } from "class-transformer";
import { ValidatorOptions, validateOrReject } from "class-validator";

export async function convertToObjectDTO<T extends object, V>(cls: ClassConstructor<T>, obj: V, options?: ClassTransformOptions, validatorOptions?: ValidatorOptions) {
    let data = plainToInstance<T, V>(cls, obj, options);
    await validateOrReject(data, validatorOptions)
    return data
}