import { iParam } from "./params.interface";

const requiredMetadataKeyQuery = Symbol("Query");

export function Query(name: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyQuery, target, propertyKey) || [];
        existingRequiredParameters.push({
          nameVariable: name,
          parameterIndex: parameterIndex
        });
        Reflect.defineMetadata(requiredMetadataKeyQuery, existingRequiredParameters, target[propertyKey], propertyKey)
    }
}