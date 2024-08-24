import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { TypeParam, iParam } from "./definition/params.interface";

export function Body(propertyKeyGet?: string) {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
    existingRequiredParameters.unshift({
      parameterIndex: parameterIndex,
      type: TypeParam.Body,
      propertyKey: propertyKeyGet
    });
    Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
  }
}