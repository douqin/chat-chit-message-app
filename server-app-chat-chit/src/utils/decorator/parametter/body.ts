import { iParam } from "./params.interface";

export const requiredMetadataKeyBody = Symbol("Body");
export function Body(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyBody, target, propertyKey) || [];
        existingRequiredParameters.push({
          nameVariable: name,
          parameterIndex: parameterIndex
        });
        Reflect.defineMetadata(requiredMetadataKeyBody, existingRequiredParameters, target[propertyKey], propertyKey)
    }
}