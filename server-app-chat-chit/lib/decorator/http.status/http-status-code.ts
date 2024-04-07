import { HttpStatus } from "@/utils/extension/httpstatus.exception";

export function HttpCode(code : HttpStatus){
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){
        Reflect.defineMetadata('httpCode', code, target, propertyKey)
    }
}