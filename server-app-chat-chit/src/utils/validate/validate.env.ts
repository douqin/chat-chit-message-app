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
        CLIENT_ID: str(),
        SECRECT_ID: str(),
        REDIRECT_URI: str(),
        REFRESH_TOKEN_DRIVE: str(),
        REFRESH_TOKEN_GMAIL: str(),
        PORT: port({ default: 3000 }),
        TWILIO_ACCOUNT_SID: str(),
        TWILIO_AUTH_TOKEN: str(),
    });
}

export default validateEnv;