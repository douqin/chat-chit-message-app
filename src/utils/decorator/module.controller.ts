import { constructor } from "tsyringe/dist/typings/types";
import MotherController from "../interface/controller.interface";

export default function Module(con: constructor<MotherController>[]) {
    return function <T extends {
        new(...args: any[]): {
        }
    }>(constructor: T) {
        return class extends constructor {
            controllers: constructor<MotherController>[] = con;
        }
    }
}