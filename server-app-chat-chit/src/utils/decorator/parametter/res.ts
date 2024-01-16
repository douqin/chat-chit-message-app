import { iParam } from "./params.interface";

export const requiredMetadataKeyRes = Symbol("Res");
export function Res() {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyRes, target, propertyKey) || [];
        existingRequiredParameters.push({
          nameVariable: undefined,
          parameterIndex: parameterIndex
        });
        Reflect.defineMetadata(requiredMetadataKeyRes, existingRequiredParameters, target[propertyKey], propertyKey)
    }
} 