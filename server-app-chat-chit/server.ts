import "reflect-metadata";
import "./module-alias.local";
import "dotenv/config";
import { App, ApplicationFactory } from "@/lib/core";
import validateEnv from "./src/utils/validate/validate.env";
import ModuleController from "@/resources/module.controller";
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { ConfigService } from "@/lib/config";
import { SocketBuilder } from "@/builder/socket.builder";
import { iNotificationService } from "@/services/fcm/fcm.service.interface";
import { globalContainer } from "./lib/common";
import { FCMService } from "@/services/fcm/fcm.service";

validateEnv();
function startServer() {
  const app = ApplicationFactory.createApplication<App, ModuleController>(
    ModuleController,
    {
      initializeSocket: true,
      baseConfigSocket: {
        cors: {
          origin: "*",
          credentials: true,
        },
      },
    }
  );
  let config = ConfigService.getInstance();
  app.use(helmet());
  app.use(cors({
    origin: "*",
    credentials: true,
  }));
  app.use(morgan("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(compression());
  app.configSocket(new SocketBuilder());
  app.listen(Number(config.get("PORT")));
  
  // App.logAllRoute(app);
}
startServer()
