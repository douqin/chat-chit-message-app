import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { TypeParam, iParam } from "./definition/params.interface";

export function Params(propertyKeyGet?: string) {
    return function (target: any, propertyKey: string, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.unshift({
            parameterIndex: parameterIndex,
            type: TypeParam.Params,
            propertyKey: propertyKeyGet
        });
        // if(Reflect.hasMetadata(requiredMetadataKeyParam, target[propertyKey], propertyKey)){
        //     Reflect.deleteMetadata(requiredMetadataKeyParam, target[propertyKey], propertyKey)
        // }
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}
