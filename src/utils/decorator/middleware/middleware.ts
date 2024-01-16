import { container, injectable } from "tsyringe";

export function Middleware() {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(constructor: T) {
        injectable()(constructor);
        container.registerSingleton(constructor.name, constructor);
        return constructor;
    }
}