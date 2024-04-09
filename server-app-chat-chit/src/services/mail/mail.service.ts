import { iMailService } from "./mail.interface";
import nodemailer, { Transporter } from "nodemailer";
import { google } from "googleapis";
import Mail from "nodemailer/lib/mailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ConfigService } from "@/lib/config";

export class MailService implements iMailService {
  private static CLIENT_ID: string;
  private static SECRECT_ID: string;
  private static REDIRECT_URI: string;
  private static REFRESH_TOKEN: string;
  private static instance: MailService = new MailService();
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;
  private constructor() {
    let configService = ConfigService.getInstance();
    MailService.CLIENT_ID = configService.get("MAIL_CLIENT_ID");
    MailService.SECRECT_ID = configService.get("MAIL_CLIENT_SECRET");
    MailService.REDIRECT_URI = configService.get("REDIRECT_URI");
    MailService.REFRESH_TOKEN = configService.get("MAIL_REFRESH_TOKEN");
  }
  async sendMail(
    mailOptions: Mail.Options
  ): Promise<SMTPTransport.SentMessageInfo> {
    return await this.transporter.sendMail(mailOptions);
  }

  static async build(): Promise<MailService> {
    if (!this.instance.transporter) {
      let oAuth2Client = new google.auth.OAuth2(
        MailService.CLIENT_ID,
        MailService.SECRECT_ID,
        MailService.REDIRECT_URI
      );
      oAuth2Client.setCredentials({
        refresh_token: MailService.REFRESH_TOKEN,
      });
      let accessToken = await oAuth2Client.getAccessToken();
      MailService.instance.transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          type: "OAuth2",
          user: "djiahak@gmail.com",
          clientId: MailService.CLIENT_ID,
          clientSecret: MailService.SECRECT_ID,
          refreshToken: MailService.REFRESH_TOKEN,
          accessToken: accessToken.token || undefined,
        },
      });
    }
    return MailService.instance;
  }
}
