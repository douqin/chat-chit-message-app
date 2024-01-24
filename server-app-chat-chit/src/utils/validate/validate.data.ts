import { ClassConstructor, ClassTransformOptions, plainToInstance } from "class-transformer";
import { ValidatorOptions, validateOrReject } from "class-validator";

export async function convertObject<T extends object, V extends object>(cls: ClassConstructor<T>, obj: V, options?: ClassTransformOptions, validatorOptions?: ValidatorOptions) {
    let data = plainToInstance<T, V>(cls, obj, options);
    await validateOrReject(data, validatorOptions)
    return data
}