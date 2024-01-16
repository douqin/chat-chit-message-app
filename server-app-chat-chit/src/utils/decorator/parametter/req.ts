import { iParam } from "./params.interface";

export const requiredMetadataKeyReq = Symbol("Req");
export function Req() {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyReq, target, propertyKey) || [];
        existingRequiredParameters.push({
            nameVariable: undefined,
            parameterIndex: parameterIndex
        });
        Reflect.defineMetadata(requiredMetadataKeyReq, existingRequiredParameters, target[propertyKey], propertyKey)
    }
}