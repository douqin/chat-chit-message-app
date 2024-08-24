import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { TypeParam, iParam } from "./definition/params.interface";

export function Headers(propertyKeyGet?: string) {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.unshift({
            parameterIndex: parameterIndex,
            type: TypeParam.Headers,
            propertyKey: propertyKeyGet
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}