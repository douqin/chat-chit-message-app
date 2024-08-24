import { requiredMetadataKeyParam } from "./definition/metadata-param";
import { TypeParam, iParam } from "./definition/params.interface";


export function Req() {
    return function (target: Object, propertyKey: string | symbol, parameterIndex: number) {
        let existingRequiredParameters: iParam[] = Reflect.getOwnMetadata(requiredMetadataKeyParam, target, propertyKey) || [];
        existingRequiredParameters.unshift({
            parameterIndex: parameterIndex,
            type: TypeParam.Req
        });
        Reflect.defineMetadata(requiredMetadataKeyParam, existingRequiredParameters, target, propertyKey)
    }
}