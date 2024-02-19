import { cleanEnv, str, port } from 'envalid';

function validateEnv(): void {
    cleanEnv(process.env, {
        NODE_ENV: str({
            choices: ['development', 'production'],
        }),
        ACCESS_TOKEN_SECRET: str(),
        ACCESS_TOKEN_LIFE: str(),
        REFRESH_TOKEN_SECRET: str(),
        REFRESH_TOKEN_LIFE: str(),
        DATABASE_NAME: str(),
        DATABASE_USER: str(),
        DATABASE_PASSWORD: str(),
        DRIVE_CLIENT_ID: str(),
        DRIVE_SECRECT_ID: str(),
        REDIRECT_URI: str(),
        REFRESH_TOKEN_DRIVE: str(),
        PORT: port({ default: 3000 }),
        REDIS_HOST: str(),
        REDIS_PORT: port({ default: 6379 }),
        DATABASE_PORT: port({ default: 3306 }),
        MAIL_CLIENT_ID: str(),
        MAIL_CLIENT_SECRET: str(),
        MAIL_REFRESH_TOKEN: str(),
    });
}

export default validateEnv;