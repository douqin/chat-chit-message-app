// import 'module-alias/register';
import moduleAlias from "module-alias";
import "reflect-metadata";
moduleAlias.addAliases({
  "@/resources": `${__dirname}/src/resources`,
  "@/builder": `${__dirname}/src/builder`,
  "@/utils": `${__dirname}/src/utils`,
  "@/middleware": `${__dirname}/src/middleware`,
  "@/models": `${__dirname}/src/models`,
  "@/lib": `${__dirname}/lib`,
  "@/services": `${__dirname}/src/services`,
});
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
import "dotenv/config";
import { SocketBuilder } from "@/builder/socket.builder";

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
  App.logAllRoute(app);
}

startServer();
