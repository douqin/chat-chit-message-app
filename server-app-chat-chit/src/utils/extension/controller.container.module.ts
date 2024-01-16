import { container } from "tsyringe"
import MotherController from "../interface/controller.interface"
import AuthController from "@/resources/auth/auth.controller"
import GroupController from "@/resources/group/group.controller"
import MeController from "@/resources/me/me.controller"
import MessageController from "@/resources/messaging/message.controller"
import RelationshipController from "@/resources/relationship/relation.controller"
import StoryController from "@/resources/story/story.controller"
import UserController from "@/resources/user/user.controller"
import { constructor } from "tsyringe/dist/typings/types"

export function RegisterModuleController(controllers: constructor<MotherController>[]) {
    for(let controller of controllers) {
        container.register<MotherController>("controller", { useClass: controller })
    }
}