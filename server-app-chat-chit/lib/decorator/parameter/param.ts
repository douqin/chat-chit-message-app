import { Type, iParam } from "./definition/params.interface";

export const requiredMetadataKeyParam = Symbol("Param");

export function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.push({
            nameVariable: name,
            parameterIndex: parameterIndex,
            type: Type.Param
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}
