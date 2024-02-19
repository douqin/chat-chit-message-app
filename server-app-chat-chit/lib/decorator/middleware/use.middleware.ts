import { BaseMiddleware } from "@/lib/common";
import { constructor } from "tsyringe/dist/typings/types";

export function UseMiddleware(middleware: constructor<BaseMiddleware>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (!Reflect.hasMetadata('middlewares', target[propertyKey])) {
            Reflect.defineMetadata('middlewares', [], target[propertyKey]);
        }
        const middlewares: any[] = Reflect.getMetadata('middlewares', target[propertyKey]);
        middlewares.push(middleware);
        Reflect.defineMetadata('middlewares', middlewares, target[propertyKey]);
    };
}