import { container } from "tsyringe"
import { constructor } from "tsyringe/dist/typings/types"
import { MotherController } from "@/lib/base"

export function RegisterModuleController(controllers: constructor<MotherController>[]) {
    for(let controller of controllers) {
        container.register<MotherController>("controller", { useClass: controller })
    }
}