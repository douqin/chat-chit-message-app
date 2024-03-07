import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { Type, iParam } from "./definition/params.interface";

export function Header(propertyKeyGet?: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.unshift({
            parameterIndex: parameterIndex,
            type: Type.Headers,
            propertyKey: propertyKeyGet
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}