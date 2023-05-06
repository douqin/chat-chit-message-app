import 'module-alias/register';
import App from "./src/Application";
import validateEnv from "./src/utils/validateEnv";
require('dotenv').config()
validateEnv();
new App(Number(process.env.PORT) || 3000).listen();

