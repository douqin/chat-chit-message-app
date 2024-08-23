import { Module } from "../../lib/decorator";
import AuthController from "./auth/auth.controller";
import GroupController from "./group/group.controller";
import MeController from "./me/me.controller";
import MessageController from "./messaging/message.controller";
import RelationshipController from "./relationship/relation.controller";
import UserController from "./user/user.controller";
@Module([
  AuthController,
  GroupController,
  MeController,
  MessageController,
  RelationshipController,
  UserController,
])
export default class ModuleController {}
