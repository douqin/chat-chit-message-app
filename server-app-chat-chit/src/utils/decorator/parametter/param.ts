import { iParam } from "./params.interface";

export const requiredMetadataKeyParam = Symbol("Param");

export function Param(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.push({
            nameVariable: name,
            parameterIndex: parameterIndex
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target[propertyKey], propertyKey)
    }
}
