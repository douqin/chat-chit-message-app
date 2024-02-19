import { Type, iParam } from "./definition/params.interface";

export const requiredMetadataKeyBody = Symbol("Body");
export function Body() {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyBody, target, propertyKey) || [];
        existingRequiredParameters.push({
          parameterIndex: parameterIndex,
          type: Type.Body
        });
        Reflect.defineMetadata(requiredMetadataKeyBody, existingRequiredParameters, target, propertyKey)
    }
}