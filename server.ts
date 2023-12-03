// import 'module-alias/register';
import moduleAlias from 'module-alias';
moduleAlias.addAliases({
    "@/resources": `${__dirname}/src/resources`,
    "@/config": `${__dirname}/src/config`,
    "@/utils": `${__dirname}/src/utils`,
    "@/middleware": `${__dirname}/src/middleware`,
    "@/models" : `${__dirname}/src/models`,
});

import App from "./src/main.application";
import validateEnv from "./src/utils/validateEnv";
require('dotenv').config()
validateEnv();
App.gI().listen();