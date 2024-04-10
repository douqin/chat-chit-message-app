import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { Type, iParam } from "./definition/params.interface";

export function Res() {
  return function (target: any, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
    existingRequiredParameters.unshift({
      parameterIndex: parameterIndex,
      type: Type.Res
    });
    Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
  }
} 