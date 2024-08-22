import { HttpStatus } from "@/lib/common"

export function HttpCode(code : HttpStatus){
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor){
        Reflect.defineMetadata('httpCode', code, target, propertyKey)
    }
}