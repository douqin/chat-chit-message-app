// import 'module-alias/register';
import moduleAlias from 'module-alias';
import "reflect-metadata";  
moduleAlias.addAliases({
    "@/resources": `${__dirname}/src/resources`,
    "@/config": `${__dirname}/src/config`,
    "@/utils": `${__dirname}/src/utils`,
    "@/middleware": `${__dirname}/src/middleware`,
    "@/models" : `${__dirname}/src/models`,
    "@/lib" : `${__dirname}/lib`,
    "@/services" : `${__dirname}/src/services`,
});

import App from "./src/main.application";
import validateEnv from "./src/utils/validate/validate.env";
require('dotenv').config()
validateEnv();
App.gI().listen();