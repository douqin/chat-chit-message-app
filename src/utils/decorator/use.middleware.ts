import BaseMiddleware from "@/middleware/base.middleware";
import { constructor } from "tsyringe/dist/typings/types";

export default function useMiddleware(middleware: constructor<BaseMiddleware>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        
    };
}