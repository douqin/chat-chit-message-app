
import { MySql } from '@/config/sql/mysql';
import Token from '@/utils/definition/token';
import jwt, { Secret, sign as _sign, verify as _verify } from 'jsonwebtoken';
import { token } from 'morgan';
import { stringify } from 'querystring';
require('dotenv').config()
const accessTokenLife = process.env.ACCESS_TOKEN_LIFE || "cc";
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "cc";
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || "";
const refreshTokenLife = process.env.REFRESH_TOKEN_LIFE || "cc";
class AuthHandler {
    static instance = new AuthHandler()
    constructor() {

    }
    private generateToken = async (payload: string | object | Buffer, secretSignature: string, tokenLife: string | number | undefined) => {
        try {
            let options: jwt.SignOptions = {
                algorithm: 'HS256',
                expiresIn: tokenLife,
            }
            return jwt.sign(
                {
                    payload,
                },
                secretSignature,
                options
            );
        } catch (error) {
            console.log(`Error in generate access token:  + ${error}`);
            return null;
        }
    };
    public generateAccessToken = async (iduser: string) => {
        let dataForAccessToken = {
            iduser: iduser,
        }
        return await this.generateToken(
            dataForAccessToken,
            accessTokenSecret,
            accessTokenLife,
        )
    };
    private generateRefreshToken = async (iduser: string) => {
        let dataForToken = {
            iduser: iduser,
        }
        return await this.generateToken(
            dataForToken,
            refreshTokenSecret,
            refreshTokenLife,
        )
    };
    private decodeToken = async (token: any, secretKey: any) => {
        try {
            return jwt.verify(token, secretKey, {
                ignoreExpiration: true,
            });
        } catch (error) {
            console.log(`Error in decode access token: ${error}`);
            return null;
        }
    };
    private decodeToken2 = async (token: any, secretKey: any) => {
        try {
            let a = jwt.verify(token, secretKey);
            return true;
        } catch (error) {
            console.log(`Error in decode access token: ${error}`);
            return false;
        }
    };
    public decodeAccessToken = async (accessToken: any) => {
        return await this.decodeToken(accessToken, accessTokenSecret);
    }
    private decodeRefreshToken = async (refreshToken: any) => {
        return await this.decodeToken(refreshToken, refreshTokenSecret);
    }
    private async getRefreshTokenFromBD(iduser: number): Promise<string | null> {
        let query: string = "SELECT refreshtoken FROM token WHERE iduser ='" + `${iduser}` + "'";
        try {
            let data2: any = await MySql.excuteStringQuery(query);
            if (data2.length === 0) {
                return null;
            }
            return data2[0].refreshtoken;
        } catch (error) {
            console.log(error);
            return null;
        }
        //	return await JSON.parse(JSON.stringify(data));;
    }
    public async getFullToken(iduser: number): Promise<Token | undefined> {
        let accessToken = await this.generateAccessToken(`${iduser}`);
        if (!accessToken) {
            return undefined;
        }
        let refreshToken = await this.generateRefreshToken(`${iduser}`);
        if (refreshToken) {
            let tokenOld = refreshToken;
            refreshToken = await this.generateRefreshToken(`${iduser}`);
            if (!refreshToken) {
                return undefined;
            }
            // else {
            //     await MySql.excuteQuery("DELETE FROM token WHERE iduser ='" +
            //         `${iduser}` +
            //         "' and refreshtoken = '" +
            //         tokenOld + "'");
            // }

            let token: Token = {
                refreshToken: refreshToken,
                accessToken: accessToken
            }
            if (await this.saveFullToken(iduser, token)) {
                return token;
            }
        }
        return undefined;
    }
    public checkHSDAccessToken = async (accessToken: any) => {
        return await this.decodeToken2(accessToken, accessTokenSecret);
    }
    public checkHSDRefreshToken = async (refreshToken: any) => {
        return await this.decodeToken2(refreshToken, refreshTokenSecret);
    }
    private async saveFullToken(iduser: number, Token: Token): Promise<boolean> {
        let refreshToken = Token.refreshToken
        let accessToken = Token.accessToken
        let query = 'INSERT INTO token (iduser, refreshtoken, accesstoken) VALUES (' +
            `${iduser}` +
            ",'" + refreshToken + "'" + ",'" + accessToken + "')";
        let result: boolean = true;
        try {
            let result1 = await MySql.excuteStringQuery(query);
        }
        catch (err) {
            console.log(err)
            result = false;
        }
        return result;
    }
}
export default AuthHandler.instance;