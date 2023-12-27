// import 'module-alias/register';
import moduleAlias from 'module-alias';
import "reflect-metadata";  
moduleAlias.addAliases({
    "@/resources": `${__dirname}/src/resources`,
    "@/config": `${__dirname}/src/config`,
    "@/utils": `${__dirname}/src/utils`,
    "@/middleware": `${__dirname}/src/middleware`,
    "@/models" : `${__dirname}/src/models`,
});

import App from "./src/main.application";
import validateEnv from "./src/utils/validateEnv";
import { RegisterModuleController } from '@/utils/extension/controller.container.module';
import controllers from '@/resources/module.controller';
require('dotenv').config()
validateEnv();
App.gI().listen();