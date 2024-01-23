import { MotherController } from "@/lib/base";
import { constructor } from "tsyringe/dist/typings/types";

export function Module(con: constructor<MotherController>[]) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(constructor: T) {
        return class extends constructor {
            controllers: constructor<MotherController>[] = con;
        }
    }
}