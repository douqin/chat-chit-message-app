import { BaseMiddleware } from "@/lib/common";
import { TypeClass } from "@/lib/types";

export function UseGuard(middleware: TypeClass<BaseMiddleware>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!Reflect.hasMetadata('middlewares', target[propertyKey])) {
            Reflect.defineMetadata('middlewares', [], target[propertyKey]);
        }
        const middlewares: any[] = Reflect.getMetadata('middlewares', target[propertyKey]);
        middlewares.unshift(middleware);
        Reflect.defineMetadata('middlewares', middlewares, target[propertyKey]);
    };
}