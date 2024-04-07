import { MotherController } from "@/lib/common";
import { TypeClass } from "@/lib/types";

export function Module(con: TypeClass<MotherController>[]) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(_class: T) {
        return class extends _class {
            controllers: TypeClass<MotherController>[] = con;
        }
    }
}