import MotherController from "@/utils/interface/controller.interface";
import { constructor } from "tsyringe/dist/typings/types";
import AuthController from "./auth/auth.controller";
import GroupController from "./group/group.controller";
import MeController from "./me/me.controller";
import MessageController from "./messaging/message.controller";
import RelationshipController from "./relationship/relation.controller";
import StoryController from "./story/story.controller";
import UserController from "./user/user.controller";
import Module from "@/utils/decorator/module.controller";

@Module([
    AuthController,
    GroupController,
    MeController,
    MessageController,
    StoryController,
    RelationshipController,
    UserController,
])
export default class ModuleController {
}
