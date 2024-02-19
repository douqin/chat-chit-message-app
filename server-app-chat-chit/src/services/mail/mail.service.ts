import { iMailService } from "./mail.interface"
import nodemailer, { Transporter } from "nodemailer";
import { google } from "googleapis";
import Mail from "nodemailer/lib/mailer";
import { DataMailResult } from "src/job-queue/mail/data-define/data-result";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const CLIENT_ID = process.env.MAIL_CLIENT_ID
const SECRECT_ID = process.env.MAIL_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN

export class MailService implements iMailService {
    private static instance: MailService = new MailService();
    private transporter: Transporter<SMTPTransport.SentMessageInfo>;
    private constructor() {

    }
    async sendMail(mailOptions: Mail.Options): Promise<SMTPTransport.SentMessageInfo> {
        return await this.transporter.sendMail(mailOptions)
    }

    static async build(): Promise<MailService> {
        if (!this.instance.transporter) {
            let oAuth2Client = new google.auth.OAuth2(CLIENT_ID, SECRECT_ID, REDIRECT_URI)
            oAuth2Client.setCredentials({
                refresh_token: REFRESH_TOKEN,
            });
            let accessToken = await oAuth2Client.getAccessToken()
            MailService.instance.transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: { 
                    type: 'OAuth2',
                    user: 'djiahak@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: SECRECT_ID,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken.token || undefined
                }
            });
        }
        return MailService.instance
    }
}