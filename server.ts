// import 'module-alias/register';
import moduleAlias from 'module-alias';
moduleAlias.addAliases({
    "@/resources": `${__dirname}/src/resources`,
    "@/config": `${__dirname}/src/config`,
    "@/utils": `${__dirname}/src/utils`,
    "@/middleware": `${__dirname}/src/middleware`,
});

import App from "./src/main.application";
import validateEnv from "./src/utils/validateEnv";
require('dotenv').config()
validateEnv();
new App(Number(process.env.PORT) || 3000).listen();