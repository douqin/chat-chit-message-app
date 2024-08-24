import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { TypeParam, iParam } from "./definition/params.interface";

export function Next() {
    return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.unshift({
          parameterIndex: parameterIndex,
          type: TypeParam.Next
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}