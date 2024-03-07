import { ClassConstructor, ClassTransformOptions, plainToInstance } from "class-transformer";
import { ValidatorOptions, validateOrReject } from "class-validator";

export async function convertToObjectDTO<T extends object, V>(cls: ClassConstructor<T>, obj: V, options?: ClassTransformOptions, validatorOptions?: ValidatorOptions) {
    let data = plainToInstance<T, V>(cls, obj, options);
    if (isBasicType(data)) return data
    await validateOrReject(data, validatorOptions)
    return data
}
function isBasicType(value: any): boolean {
    return typeof value === "number" ||
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "symbol" ||
        typeof value === "bigint" ||
        typeof value === "undefined" ||
        typeof value === "function";
}
